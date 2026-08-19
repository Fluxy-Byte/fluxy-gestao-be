import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";
import { trialEnded } from "../../domain/billing";

declare global {
    namespace Express {
        interface Request {
            userId: string;
            userRole: string;
            userBillingBlocked: boolean;
            // true quando o mês gratuito já terminou e o usuário ainda não confirmou a
            // contratação da plataforma (e não está isento de cobrança) — ver trialEnded.
            userNeedsContract: boolean;
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
    const billingExempt = (session.user as any).billingExempt ?? false;
    const contractAccepted = (session.user as any).contractAccepted ?? false;

    req.userId = session.user.id;
    req.userRole = (session.user as any).role ?? "user";
    req.userBillingBlocked = (session.user as any).billingBlocked ?? false;
    req.userNeedsContract = !billingExempt && !contractAccepted && trialEnded(new Date(session.user.createdAt));
    next();
}

// Gate para rotas operacionais (clientes, ordens, despesas, etc.) — usuários com o mês
// gratuito encerrado que ainda não confirmaram a contratação, ou com fatura vencida,
// ficam sem acesso à operação mas continuam podendo logar e ver/pagar suas faturas ou
// aceitar o contrato (rotas de billing e perfil não usam este middleware). Admins e
// usuários isentos (billingExempt) nunca são bloqueados por cobrança.
export async function requireActiveBilling(req: Request, res: Response, next: NextFunction) {
    if (req.userRole === "admin") {
        next();
        return;
    }
    if (req.userNeedsContract) {
        res.status(403).json({
            error: "Seu mês gratuito terminou. Confirme a contratação da plataforma no Perfil para continuar usando o sistema.",
            reason: "contract_required",
        });
        return;
    }
    if (req.userBillingBlocked) {
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
