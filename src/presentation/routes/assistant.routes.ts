import { Router } from "express";
import { assistantController } from "../controllers/assistant.controller";
import { asyncHandler } from "../error-handler";

export const assistantRoutes = Router();

assistantRoutes.get("/users/by-phone", asyncHandler(assistantController.byPhone));
assistantRoutes.get("/users/:userId", asyncHandler(assistantController.profile));
assistantRoutes.get("/users/:userId/dashboard", asyncHandler(assistantController.dashboard));
assistantRoutes.get("/users/:userId/report", asyncHandler(assistantController.report));
assistantRoutes.get("/users/:userId/clients", asyncHandler(assistantController.searchClients));
assistantRoutes.get("/users/:userId/clients/:clientId/orders", asyncHandler(assistantController.ordersByClient));
assistantRoutes.get("/users/:userId/clients/:clientId/link", asyncHandler(assistantController.clientLink));
assistantRoutes.get("/users/:userId/debts", asyncHandler(assistantController.debts));
assistantRoutes.get("/users/:userId/expenses", asyncHandler(assistantController.expenses));
assistantRoutes.get("/users/:userId/financial-report", asyncHandler(assistantController.financialReport));
assistantRoutes.get("/users/:userId/invoice", asyncHandler(assistantController.invoice));
