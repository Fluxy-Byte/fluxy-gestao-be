import type { NextFunction, Request, Response } from "express";

// Gate para rotas chamadas por outros serviços internos (hoje: o agente de WhatsApp
// "Fly" em agents/fluxygestao), não por sessão de usuário — sem cookie, sem Better
// Auth. Autenticação simples por chave compartilhada em header, mesmo nível de
// maturidade das outras integrações internas do projeto.
export async function requireInternalService(req: Request, res: Response, next: NextFunction) {
    const key = req.header("x-internal-api-key");
    if (!key || key !== process.env.INTERNAL_API_KEY) {
        res.status(401).json({ error: "Não autorizado." });
        return;
    }
    next();
}
