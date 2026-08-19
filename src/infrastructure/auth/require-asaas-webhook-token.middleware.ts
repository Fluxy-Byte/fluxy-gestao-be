import type { NextFunction, Request, Response } from "express";

// Gate para o webhook de pagamento da Asaas. A Asaas reenvia, em todo POST de
// webhook, o "Token de acesso" configurado no painel (Integrações > Webhooks) no
// header `asaas-access-token` — comparamos com o valor configurado aqui para
// garantir que a chamada realmente veio da Asaas.
export function requireAsaasWebhookToken(req: Request, res: Response, next: NextFunction) {
    const token = req.header("asaas-access-token");
    if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
        res.status(401).json({ error: "Não autorizado." });
        return;
    }
    next();
}
