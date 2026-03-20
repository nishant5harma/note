// tests/common/helpers/create-test-app.ts
import express from "express";
export async function createTestApp() {
    const { default: AppRouter } = await import("../../../modules/app/app.route.js");
    const app = express();
    app.use(express.json());
    app.use("/api", AppRouter);
    return app;
}
//# sourceMappingURL=create-test-app.js.map