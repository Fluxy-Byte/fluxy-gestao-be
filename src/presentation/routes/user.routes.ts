import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { asyncHandler } from "../error-handler";
import { uploadLogo } from "../../infrastructure/storage/upload.middleware";

export const userRoutes = Router();

userRoutes.get("/me", asyncHandler(userController.me));
userRoutes.patch("/me/profile", asyncHandler(userController.updateProfile));
userRoutes.patch("/me/company", asyncHandler(userController.updateCompany));
userRoutes.patch("/me/brand", asyncHandler(userController.updateBrand));
userRoutes.post("/me/logo", uploadLogo, asyncHandler(userController.uploadLogo));
