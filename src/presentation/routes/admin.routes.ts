import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { asyncHandler } from "../error-handler";

export const adminRoutes = Router();

adminRoutes.get("/metrics", asyncHandler(adminController.metrics));
adminRoutes.get("/audit-log", asyncHandler(adminController.auditLog));
adminRoutes.get("/overdue-users", asyncHandler(adminController.overdueUsers));
