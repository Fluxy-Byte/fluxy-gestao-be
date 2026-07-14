import { Router } from "express";
import { serviceController } from "../controllers/service.controller";
import { asyncHandler } from "../error-handler";

export const serviceRoutes = Router();

serviceRoutes.get("/", asyncHandler(serviceController.list));
serviceRoutes.post("/", asyncHandler(serviceController.create));
serviceRoutes.patch("/:id", asyncHandler(serviceController.update));
serviceRoutes.delete("/:id", asyncHandler(serviceController.remove));
