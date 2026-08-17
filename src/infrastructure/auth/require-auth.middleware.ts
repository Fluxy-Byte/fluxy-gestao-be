import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

declare global {
    namespace Express {
        interface Request {
            userId: string;
            userRole: string;
            userBillingBlocked: boolean;
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
        res.status(401).json({ error: "Não autenticado." });
        return;
    }
    if ((session.user as any).banned) {
        res.status(403).json({ error: "Acesso bloqueado." });
        return;
    }
    req.userId = session.user.id;
    req.userRole = (session.user as any).role ?? "user";
    req.userBillingBlocked = (session.user as any).billingBlocked ?? false;
    next();
}

// Gate para rotas operacionais (clientes, ordens, despesas, etc.) — usuários com
// fatura vencida ficam sem acesso à operação mas continuam podendo logar e ver/pagar
// suas faturas (rotas de billing e perfil não usam este middleware). Admins nunca
// são bloqueados por atraso de pagamento.
export async function requireActiveBilling(req: Request, res: Response, next: NextFunction) {
    if (req.userRole !== "admin" && req.userBillingBlocked) {
        res.status(403).json({ error: "Conta bloqueada por falta de pagamento. Regularize sua fatura no Perfil.", reason: "billing_blocked" });
        return;
    }
    next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.userRole !== "admin") {
        res.status(403).json({ error: "Acesso restrito a administradores." });
        return;
    }
    next();
}
