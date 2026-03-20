// src/modules/socket/util-socket/push.sender.ts
import { prisma } from "../../../db/db.js";
import { getIo } from "../../../modules/socket/socket.service.js";
import webpush from "web-push";
import admin from "firebase-admin";
import fs from "fs";
let firebaseInitialized = false;
/**
 * Init firebase-admin (FCM) using either JSON string or File Path
 */
function initFirebaseAdmin() {
    if (firebaseInitialized)
        return;
    const fcmKeyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const fcmKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS_PATH;
    try {
        if (fcmKeyJson) {
            const parsed = JSON.parse(fcmKeyJson);
            admin.initializeApp({ credential: admin.credential.cert(parsed) });
            firebaseInitialized = true;
            if (process.env.NODE_ENV !== "test")
                console.log("🔔 firebase-admin initialized from JSON env");
        }
        else if (fcmKeyPath && fs.existsSync(fcmKeyPath)) {
            // Using readFileSync is safer for ESM than 'require'
            const key = JSON.parse(fs.readFileSync(fcmKeyPath, "utf-8"));
            admin.initializeApp({ credential: admin.credential.cert(key) });
            firebaseInitialized = true;
            if (process.env.NODE_ENV !== "test")
                console.log("🔔 firebase-admin initialized from file path");
        }
    }
    catch (err) {
        console.warn("firebase-admin init failed:", err);
    }
}
/**
 * Init web-push VAPID details
 */
function initWebPush() {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
    if (publicKey && privateKey) {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        return true;
    }
    return false;
}
const webpushEnabled = initWebPush();
initFirebaseAdmin();
/**
 * Helper: Emit to socket (via userId room)
 */
async function emitToSocket(userId, event, payload) {
    try {
        const io = getIo();
        if (!io)
            return false;
        io.to(userId).emit(event, payload);
        return true;
    }
    catch (err) {
        console.warn("emitToSocket error:", err);
        return false;
    }
}
/**
 * Helper: Send WebPush notification
 */
async function sendWebPush(subscription, payload) {
    if (!webpushEnabled)
        return false;
    try {
        const ttl = parseInt(process.env.PUSH_DEFAULT_TTL_SECONDS ?? "60", 10);
        await webpush.sendNotification(subscription, JSON.stringify(payload), {
            TTL: ttl,
        });
        return true;
    }
    catch (err) {
        console.warn("webpush send error:", err);
        return false;
    }
}
/**
 * Helper: Send FCM data-only message
 */
async function sendFcmToToken(token, data) {
    if (!firebaseInitialized)
        return false;
    try {
        const message = {
            token,
            data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
            android: { priority: "high" },
            apns: {
                payload: { aps: { "content-available": 1 } },
            },
        };
        await admin.messaging().send(message);
        return true;
    }
    catch (err) {
        console.warn("FCM send error:", err);
        return false;
    }
}
/**
 * sendPushToUser:
 * Queries user devices and attempts delivery across all platforms (Socket, Web, Mobile).
 */
export async function sendPushToUser(userId, payload) {
    const devices = await prisma.device.findMany({ where: { userId } });
    const results = [];
    // Try realtime socket first
    await emitToSocket(userId, payload.type ?? "push", payload);
    for (const d of devices) {
        const platform = (d.platform ?? "unknown").toLowerCase();
        const token = d.pushToken;
        const meta = d.meta;
        try {
            let ok = false;
            if (platform === "web") {
                let subscription = null;
                if (token?.startsWith("{")) {
                    try {
                        subscription = JSON.parse(token);
                    }
                    catch { }
                }
                if (!subscription && meta) {
                    subscription =
                        meta.subscription ||
                            meta.pushSubscription ||
                            meta.push?.subscription ||
                            null;
                }
                if (subscription) {
                    ok = await sendWebPush(subscription, payload);
                }
            }
            else if (token) {
                ok = await sendFcmToToken(token, payload);
            }
            results.push({ deviceId: d.id, platform, ok });
        }
        catch (err) {
            results.push({
                deviceId: d.id,
                platform,
                ok: false,
                reason: String(err),
            });
        }
    }
    return { devices: results, count: results.length };
}
/**
 * sendLocationFetchSignal:
 * Specific signal used to request GPS from a mobile device.
 */
export async function sendLocationFetchSignal(userId, requestId) {
    const payload = {
        type: "LOCATION_FETCH",
        requestId,
        silent: true,
        ts: new Date().toISOString(),
    };
    // Immediate socket attempt
    await emitToSocket(userId, "location.fetch_request", payload);
    // Fallback to Push (FCM/Web)
    return await sendPushToUser(userId, payload);
}
//# sourceMappingURL=push.sender.js.map