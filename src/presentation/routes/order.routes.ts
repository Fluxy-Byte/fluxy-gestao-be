import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { asyncHandler } from "../error-handler";

export const orderRoutes = Router();

orderRoutes.get("/dashboard", asyncHandler(orderController.dashboard));
orderRoutes.get("/report", asyncHandler(orderController.report));
orderRoutes.get("/open", asyncHandler(orderController.listOpen));
orderRoutes.get("/closed", asyncHandler(orderController.listClosed));
orderRoutes.get("/receivable", asyncHandler(orderController.listReceivable));
orderRoutes.get("/:id", asyncHandler(orderController.detail));
orderRoutes.post("/", asyncHandler(orderController.create));
orderRoutes.post("/:id/complete", asyncHandler(orderController.complete));
orderRoutes.post("/:id/reopen", asyncHandler(orderController.reopen));
orderRoutes.post("/:id/cancel", asyncHandler(orderController.cancel));
orderRoutes.patch("/:id/payment-status", asyncHandler(orderController.updatePayment));
orderRoutes.delete("/:id", asyncHandler(orderController.remove));
