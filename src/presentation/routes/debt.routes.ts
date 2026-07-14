import { Router } from "express";
import { debtController } from "../controllers/debt.controller";
import { asyncHandler } from "../error-handler";

export const debtRoutes = Router();

debtRoutes.get("/", asyncHandler(debtController.list));
debtRoutes.post("/", asyncHandler(debtController.create));
debtRoutes.patch("/:id", asyncHandler(debtController.update));
debtRoutes.delete("/:id", asyncHandler(debtController.remove));
