// /src/script/seed/super-admin-seed.ts
import { prisma } from "../../db/db.js";
import bcrypt from "bcrypt";
/**
 * Full DB seed for dev: permissions, superadmin role, role->permission links, superadmin user.
 * Works with the multi-team schema (TeamMember / TeamRequest).
 */
async function main() {
    console.log("🌱 Starting full database seed...");
    // 1️⃣ Base permissions
    const basePermissions = [
        // User management
        { key: "user.read", description: "View user data", module: "User" },
        { key: "user.create", description: "Create users", module: "User" },
        { key: "user.write", description: "Write users", module: "User" },
        { key: "user.update", description: "Update user data", module: "User" },
        { key: "user.delete", description: "Delete users", module: "User" },
        // Role management
        { key: "role.read", description: "View roles", module: "Role" },
        { key: "role.create", description: "Create roles", module: "Role" },
        { key: "role.write", description: "Write roles", module: "Role" },
        { key: "role.update", description: "Update roles", module: "Role" },
        { key: "role.delete", description: "Delete roles", module: "Role" },
        // Permission management
        {
            key: "permission.read",
            description: "View permissions",
            module: "Permission",
        },
        {
            key: "permission.assign",
            description: "Assign permissions to roles",
            module: "Permission",
        },
        {
            key: "permission.write",
            description: "Write permissions",
            module: "Permission",
        },
        {
            key: "permission.delete",
            description: "delete permissions",
            module: "Permission",
        },
        // Team management
        { key: "team.read", description: "View teams", module: "Team" },
        { key: "team.create", description: "Create teams", module: "Team" },
        { key: "team.update", description: "Update teams", module: "Team" },
        { key: "team.delete", description: "Delete teams", module: "Team" },
        {
            key: "team.write",
            description: "Write teams (approve assignments/removals)",
            module: "Team",
        },
        { key: "team.assignLead", description: "Assign team lead", module: "Team" },
        {
            key: "team.request",
            description: "Create team membership requests (assign/remove/join/transfer)",
            module: "Team",
        },
        {
            key: "team.approve",
            description: "Approve team requests (HR/Manager)",
            module: "Team",
        },
        // Audit logs
        {
            key: "auditlog.read",
            description: "View audit logs",
            module: "AuditLog",
        },
        // System
        {
            key: "system.config",
            description: "Access system configuration",
            module: "System",
        },
        {
            key: "admin.view",
            description: "Access to the Admin Dashboard",
            module: "System",
        },
        //
        // ===== NEW: HR / Attendance / Location / Device / Consent related permissions =====
        //
        // Attendance
        {
            key: "attendance.self",
            description: "Perform own attendance check-in",
            module: "Attendance",
        },
        {
            key: "attendance.read",
            description: "Read attendance records (admin/manager)",
            module: "Attendance",
        },
        // Location requests (on-demand)
        {
            key: "location.request",
            description: "Create on-demand location requests (supervisors)",
            module: "Location",
        },
        {
            key: "location.read",
            description: "Read on-demand location request results",
            module: "Location",
        },
        {
            key: "location.audit",
            description: "View location access audit records",
            module: "Location",
        },
        // Device / Push management
        {
            key: "device.register",
            description: "Register/update a device (push token)",
            module: "Device",
        },
        {
            key: "device.unregister",
            description: "Unregister device / remove push token",
            module: "Device",
        },
        {
            key: "device.read",
            description: "List devices for a user",
            module: "Device",
        },
        // Consent
        {
            key: "consent.write",
            description: "Create or revoke consent entries",
            module: "Consent",
        },
        {
            key: "consent.read",
            description: "Read consents for a user",
            module: "Consent",
        },
        // Leads
        { key: "lead.read", description: "Read leads", module: "Lead" },
        { key: "lead.write", description: "Create/update leads", module: "Lead" },
        { key: "lead.assign", description: "Assign leads", module: "Lead" },
        { key: "lead.note", description: "Add notes to leads", module: "Lead" },
        {
            key: "lead.followup",
            description: "Manage lead follow-ups",
            module: "Lead",
        },
        {
            key: "lead.webhook",
            description: "View raw webhook events",
            module: "Lead",
        },
        // Inventory
        {
            key: "inventory.read",
            description: "Read inventory data",
            module: "Inventory",
        },
        {
            key: "inventory.write",
            description: "Create/update inventory",
            module: "Inventory",
        },
        {
            key: "inventory.delete",
            description: "Delete inventory entities",
            module: "Inventory",
        },
        {
            key: "inventory.manage",
            description: "Manage advanced inventory states (BLOCK, UNDER_OFFER, SOLD, BOOKING, etc.)",
            module: "Inventory",
        },
    ];
    // 2️⃣ Upsert permissions (idempotent)
    console.log("🧩 Seeding permissions...");
    for (const perm of basePermissions) {
        await prisma.permission.upsert({
            where: { key: perm.key },
            update: {
                description: perm.description ?? undefined,
                module: perm.module ?? undefined,
            },
            create: perm,
        });
    }
    const allPermissions = await prisma.permission.findMany();
    console.log(`✅ Seeded ${allPermissions.length} permissions.`);
    // 3️⃣ Create Super Admin role (idempotent)
    console.log("👑 Creating Super Admin role...");
    const superAdminRole = await prisma.role.upsert({
        where: { name: "superadmin" },
        update: {},
        create: {
            name: "superadmin",
            description: "Full access to all system resources (seeded)",
        },
    });
    // 4️⃣ Link all permissions to Super Admin role (idempotent)
    console.log("🔗 Linking all permissions to Super Admin role...");
    const existingRolePerms = await prisma.rolePermission.findMany({
        where: { roleId: superAdminRole.id },
    });
    const existingPermissionIds = new Set(existingRolePerms.map((r) => r.permissionId));
    const linksToCreate = allPermissions
        .filter((p) => !existingPermissionIds.has(p.id))
        .map((p) => ({ roleId: superAdminRole.id, permissionId: p.id }));
    if (linksToCreate.length > 0) {
        // createMany is faster; duplicates guarded by filter above
        await prisma.rolePermission.createMany({ data: linksToCreate });
        console.log(`✅ Linked ${linksToCreate.length} permissions to Super Admin.`);
    }
    else {
        console.log("ℹ️ Super Admin already has all permissions.");
    }
    // 5️⃣ Create Super Admin user (idempotent)
    console.log("👤 Creating Super Admin user...");
    const email = "superadmin@example.com";
    const password = "SuperSecurePassword123!"; // change in prod
    // hash password
    const passwordHash = await bcrypt.hash(password, 10);
    // Upsert user and attach role via nested create on user.roles (UserRole join table)
    const superAdminUser = await prisma.user.upsert({
        where: { email },
        update: {
            name: "Super Admin",
            isActive: true,
            passwordHash,
        },
        create: {
            email,
            name: "Super Admin",
            passwordHash,
            isActive: true,
            roles: {
                create: [
                    {
                        role: {
                            connect: { id: superAdminRole.id },
                        },
                    },
                ],
            },
        },
        include: {
            roles: true,
        },
    });
    // If the user existed but did not have the role link, ensure role link exists
    const hasRoleLink = await prisma.userRole.findUnique({
        where: {
            userId_roleId: { userId: superAdminUser.id, roleId: superAdminRole.id },
        },
    });
    if (!hasRoleLink) {
        await prisma.userRole.create({
            data: { userId: superAdminUser.id, roleId: superAdminRole.id },
        });
    }
    console.log("✅ Super Admin user created/updated:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("🎉 Database seeding complete!");
}
// Run the seeder
main()
    .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=super-admin-seed.js.map