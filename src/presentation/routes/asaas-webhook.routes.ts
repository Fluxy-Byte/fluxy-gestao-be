import { Router } from "express";
import { asaasWebhookController } from "../controllers/asaas-webhook.controller";
import { requireAsaasWebhookToken } from "../../infrastructure/auth/require-asaas-webhook-token.middleware";
import { asyncHandler } from "../error-handler";

export const asaasWebhookRoutes = Router();

asaasWebhookRoutes.post("/", requireAsaasWebhookToken, asyncHandler(asaasWebhookController.receive));
