import { prisma } from "../../../db/db.js";
import { setWithTTL, getJSON } from "../../../db/redis.js";
import { emitToUser } from "../../../modules/socket/socket.service.js";
import { BadRequestError, NotFoundError, UnauthorizedError, } from "../../../utils/http-errors.util.js";
import { logAudit } from "../../../utils/audit.util.js";
import { sendLocationFetchSignal, sendPushToUser, } from "../../../modules/socket/util-socket/push.sender.js";
// src/modules/hr/location/location.service.ts
const LOCATION_REQUEST_TTL_SECONDS = parseInt(process.env.LOCATION_REQUEST_TTL_SECONDS ?? "60", 10);
const LOCATION_REQUEST_EXPIRY_SECONDS = parseInt(process.env.LOCATION_REQUEST_EXPIRY_SECONDS ?? "60", 10);
// Exported LocationService object
export const LocationService = {
    createLocationRequest,
    respondToLocationRequest,
    getLocationRequestResult,
};
export default LocationService;
// Service Function Implementations
/* --- Helpers --- */
async function ensureUserExists(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new NotFoundError("User not found");
    return user;
}
/* ---------- Location requests (supervisor -> target) ---------- */
async function createLocationRequest(actor, targetUserId, expiresInSeconds, note) {
    if (!actor)
        throw new UnauthorizedError("Actor required");
    if (!targetUserId)
        throw new BadRequestError("targetUserId required");
    await ensureUserExists(targetUserId);
    const expires = new Date(Date.now() + 1000 * (expiresInSeconds ?? LOCATION_REQUEST_EXPIRY_SECONDS));
    // Create request + audit in a transaction
    const req = await prisma.$transaction(async (tx) => {
        const r = await tx.locationRequest.create({
            data: {
                requesterId: actor.id,
                targetId: targetUserId,
                status: "PENDING",
                expiresAt: expires,
                note: note ?? null,
            },
        });
        await tx.locationAccessAudit.create({
            data: {
                actorId: actor.id,
                targetId: targetUserId,
                action: "request_created",
                meta: { note: note ?? null, expiresAt: expires.toISOString() },
            },
        });
        return r;
    });
    /*
    // Notify target (best-effort) Old code block
    try {
      await emitToUser(targetUserId, "location.requested", {
        requestId: req.id,
        requesterId: actor.id,
        note,
        expiresAt: expires.toISOString(),
      });
      await pushToUser(targetUserId, {
        type: "location.request",
        requestId: req.id,
        requesterId: actor.id,
        note,
        expiresAt: expires.toISOString(),
      });
    } catch (err) {
      console.warn("notify target failed:", err);
    }
  */
    // Notify target (best-effort) Updated code block
    try {
        // socket realtime emit (existing)
        await emitToUser(targetUserId, "location.fetch_request", {
            requestId: req.id,
            requesterId: actor.id,
            note,
            expiresAt: expires.toISOString(),
            ts: new Date().toISOString(),
        });
        // send silent push + socket fallback to ensure device wakes and fetches location
        // new: sendLocationFetchSignal will emit socket and send pushes
        await sendLocationFetchSignal(targetUserId, req.id);
    }
    catch (err) {
        console.warn("notify target failed:", err);
    }
    await logAudit({
        userId: actor.id,
        action: "location.request.create",
        resource: "locationRequest",
        resourceId: req.id,
        payload: { targetUserId, expiresAt: expires.toISOString(), note },
    });
    return req;
}
/* ---------- Respond to a location request (target user replies with coords) ---------- */
async function respondToLocationRequest(actor, requestId, payload) {
    const reqRow = await prisma.locationRequest.findUnique({
        where: { id: requestId },
    });
    if (!reqRow)
        throw new NotFoundError("Location request not found");
    if (reqRow.targetId !== actor.id)
        throw new UnauthorizedError("Only target user can respond to this request");
    if (reqRow.status !== "PENDING")
        throw new BadRequestError("Request already processed");
    if (reqRow.expiresAt.getTime() < Date.now()) {
        // mark expired
        await prisma.locationRequest.update({
            where: { id: requestId },
            data: { status: "EXPIRED" },
        });
        await prisma.locationAccessAudit.create({
            data: {
                actorId: actor.id,
                targetId: actor.id,
                action: "request_expired",
                meta: { expiredAt: new Date().toISOString() },
            },
        });
        throw new BadRequestError("Request is expired");
    }
    const recordedAt = payload.recordedAt ?? new Date().toISOString();
    // Update request -> FULFILLED and create persistent audit in a transaction
    await prisma.$transaction(async (tx) => {
        await tx.locationRequest.update({
            where: { id: requestId },
            data: {
                status: "FULFILLED",
                fulfilledAt: new Date(),
                respondedBy: actor.id,
            },
        });
        await tx.locationAccessAudit.create({
            data: {
                actorId: actor.id,
                targetId: reqRow.requesterId, // log who will receive it (requester)
                action: "request_responded",
                meta: {
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    accuracy: payload.accuracy ?? null,
                    recordedAt,
                },
            },
        });
    });
    const meta = {
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy ?? null,
        recordedAt,
    };
    // store ephemeral coordinates in Redis
    const key = `hr:location:request:${requestId}`;
    await setWithTTL(key, { ...meta, responderId: actor.id }, LOCATION_REQUEST_TTL_SECONDS);
    // publish to requester (best-effort)
    try {
        await emitToUser(reqRow.requesterId, "location.responded", {
            requestId,
            coords: meta,
            responderId: actor.id,
        });
        //-- added new code block ---//
        // also send push to requester (silent or with notification as desired)
        await sendPushToUser(reqRow.requesterId, {
            type: "LOCATION_RESPONSE",
            requestId,
            coords: meta,
            responderId: actor.id,
        });
        //--------------------------//
    }
    catch (err) {
        console.warn("emit to requester failed", err);
    }
    await logAudit({
        userId: actor.id,
        action: "location.request.respond",
        resource: "locationRequest",
        resourceId: requestId,
        payload: meta,
    });
    return { ok: true };
}
/* ---------- Get ephemeral result for a request (requester reads) ---------- */
async function getLocationRequestResult(actor, requestId) {
    const reqRow = await prisma.locationRequest.findUnique({
        where: { id: requestId },
    });
    if (!reqRow)
        throw new NotFoundError("Request not found");
    if (reqRow.requesterId !== actor.id) {
        throw new UnauthorizedError("Not allowed to read this request result");
    }
    const key = `hr:location:request:${requestId}`;
    const data = await getJSON(key, true); // remove after read
    if (!data) {
        // If nothing in redis, mark expired if appropriate
        if (reqRow.expiresAt.getTime() < Date.now() &&
            reqRow.status === "PENDING") {
            await prisma.locationRequest.update({
                where: { id: requestId },
                data: { status: "EXPIRED" },
            });
            await prisma.locationAccessAudit.create({
                data: {
                    actorId: actor.id,
                    targetId: reqRow.targetId,
                    action: "request_expired",
                    meta: { expiredAt: new Date().toISOString() },
                },
            });
        }
        return null;
    }
    // record a result_read audit (coords already persisted under respond audit)
    await prisma.locationAccessAudit.create({
        data: {
            actorId: actor.id,
            targetId: reqRow.targetId,
            action: "result_read",
            meta: { requestId },
        },
    });
    await logAudit({
        userId: actor.id,
        action: "location.request.read",
        resource: "locationRequest",
        resourceId: requestId,
        payload: { ephemeral: true },
    });
    return data;
}
//# sourceMappingURL=location.service.js.map