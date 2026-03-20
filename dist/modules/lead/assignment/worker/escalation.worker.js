// src/modules/lead/assignment/worker/escalation.worker.ts
import { Worker } from "bullmq";
import { getRedisClient } from "../../../../db/redis.js";
import { ESCALATION_QUEUE_NAME } from "../queue/queue.js";
import { prisma } from "../../../../db/db.js";
import { emitToUser } from "../../../../modules/socket/socket.service.js";
import { sendPushToUser } from "../../../../modules/socket/util-socket/push.sender.js";
const connection = getRedisClient();
export function startEscalationWorker() {
    const concurrency = Math.max(1, parseInt(process.env.LEAD_ASSIGN_WORKER_CONCURRENCY ?? "2", 10) / 2);
    const worker = new Worker(ESCALATION_QUEUE_NAME, async (job) => {
        const { leadId, assignmentId } = job.data;
        if (!leadId)
            return;
        // Load lead and assignment
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: { assignedTeam: true },
        });
        const assignment = assignmentId
            ? await prisma.leadAssignment.findUnique({
                where: { id: assignmentId },
            })
            : null;
        // Persist escalation metadata in LeadAssignment.meta (best-effort)
        try {
            const prevMeta = assignment?.meta ?? {};
            const newMeta = {
                ...prevMeta,
                escalatedAt: new Date().toISOString(),
                escalationTrigger: "max_attempts",
            };
            if (assignmentId) {
                await prisma.leadAssignment.update({
                    where: { id: assignmentId },
                    data: { meta: newMeta },
                });
            }
        }
        catch (e) {
            console.warn("escalation.worker: failed to persist meta", e);
        }
        // Create persistent LeadEscalation row
        let notifiedUsers = [];
        try {
            const escalation = await prisma.leadEscalation.create({
                data: {
                    leadId,
                    assignmentId: assignmentId ?? undefined,
                    status: "pending",
                },
            });
            // Notify team lead if exists
            const teamLeadId = lead?.assignedTeam?.teamLeadId ?? null;
            if (teamLeadId) {
                notifiedUsers.push(teamLeadId);
                try {
                    await emitToUser(teamLeadId, "lead.escalated", {
                        leadId,
                        reason: "no-available-agent",
                    });
                }
                catch (e) {
                    console.warn("escalation.worker: emitToUser failed", e);
                }
                try {
                    await sendPushToUser(teamLeadId, {
                        type: "LEAD_ESCALATED",
                        leadId,
                        reason: "no-available-agent",
                    });
                }
                catch (e) { }
            }
            else {
                // Fallback: find all users with 'lead.assign' permission
                const fallbackUsers = await prisma.user.findMany({
                    where: {
                        roles: {
                            some: {
                                role: {
                                    permissions: {
                                        some: { permission: { key: "lead.assign" } },
                                    },
                                },
                            },
                        },
                    },
                    select: { id: true },
                });
                for (const user of fallbackUsers) {
                    notifiedUsers.push(user.id);
                    try {
                        await emitToUser(user.id, "lead.escalated", { leadId });
                    }
                    catch { }
                    try {
                        await sendPushToUser(user.id, { type: "LEAD_ESCALATED", leadId });
                    }
                    catch { }
                }
            }
            // Update escalation row with notified users
            await prisma.leadEscalation.update({
                where: { id: escalation.id },
                data: { notifiedUsers },
            });
        }
        catch (e) {
            console.warn("escalation.worker: failed to create/update LeadEscalation", e);
        }
        console.log("escalation worker processed", leadId);
    }, { connection, concurrency });
    worker.on("failed", (job, err) => {
        console.error("Escalation worker failed job", job?.id, err);
    });
    console.log("Escalation worker started (concurrency=", concurrency, ")");
}
//# sourceMappingURL=escalation.worker.js.map