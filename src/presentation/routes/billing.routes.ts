import { Router } from "express";
import { billingController } from "../controllers/billing.controller";
import { asyncHandler } from "../error-handler";

export const billingRoutes = Router();

billingRoutes.get("/invoices", asyncHandler(billingController.list));
billingRoutes.post("/invoices/:id/regenerate", asyncHandler(billingController.regenerate));
