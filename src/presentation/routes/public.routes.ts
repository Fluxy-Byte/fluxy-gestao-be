import { Router } from "express";
import { publicController } from "../controllers/public.controller";
import { asyncHandler } from "../error-handler";

export const publicRoutes = Router();

publicRoutes.get("/catalog", asyncHandler(publicController.catalog));
