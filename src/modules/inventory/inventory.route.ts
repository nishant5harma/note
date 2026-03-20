// /src/modules/inventory/inventory.route.ts

import { Router } from "express";
import ProjectRouter from "./project/project.route.js";
import TowerRouter from "./tower/tower.route.js";
import UnitRouter from "./unit/unit.route.js";
import ListingRouter from "./listing/listing.route.js";
import ReservationRouter from "./reservation/reservation.route.js";

export const InventoryRouter: Router = Router();

InventoryRouter.use("/projects", ProjectRouter);
InventoryRouter.use("/towers", TowerRouter);
InventoryRouter.use("/units", UnitRouter);
InventoryRouter.use("/listings", ListingRouter);
InventoryRouter.use("/reservations", ReservationRouter);

export default InventoryRouter;
