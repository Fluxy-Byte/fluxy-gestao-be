import type { Request, Response } from "express";

import { userRepository } from "../../infrastructure/repositories/user.repository";
import { clientRepository } from "../../infrastructure/repositories/client.repository";
import { orderRepository } from "../../infrastructure/repositories/order.repository";
import { debtRepository } from "../../infrastructure/repositories/debt.repository";
import { expenseRepository } from "../../infrastructure/repositories/expense.repository";
import { invoiceRepository } from "../../infrastructure/repositories/invoice.repository";
import { cashMovementRepository } from "../../infrastructure/repositories/cash-movement.repository";

import { findUserByPhoneUsecase } from "../../application/usecases/assistant/find-user-by-phone.usecase";
import { findClientByNameUsecase } from "../../application/usecases/assistant/find-client-by-name.usecase";
import { getUserInvoiceUsecase } from "../../application/usecases/assistant/get-user-invoice.usecase";
import { getDashboardUsecase } from "../../application/usecases/order/get-dashboard.usecase";
import { getReportUsecase } from "../../application/usecases/order/get-report.usecase";
import { listOrdersByClientUsecase } from "../../application/usecases/order/list-orders.usecase";
import { listDebtsUsecase } from "../../application/usecases/debt/list-debts.usecase";
import { listExpensesUsecase } from "../../application/usecases/expense/list-expenses.usecase";
import { getFinancialReportUsecase } from "../../application/usecases/expense/get-financial-report.usecase";

import { serialize } from "../serialize";
import type { OrderStatus } from "../../../generated/prisma/client";

// Todas as rotas aqui são chamadas pelo agente de WhatsApp (Fly), não por sessão de
// usuário — por isso o userId sempre vem de req.params, nunca de req.userId, e o gate
// Diamante é reimplementado localmente (o middleware requireDiamante depende de
// req.userPlan, que só requireAuth preenche).
async function requireDiamantePlan(userId: string): Promise<{ id: string; role: string; plan: string } | { error: string; status: number }> {
    const user = await userRepository.findById(userId);
    if (!user) return { error: "Usuário não encontrado.", status: 404 };
    if (user.role !== "admin" && user.plan !== "diamante") {
        return { error: "Funcionalidade disponível apenas no plano Diamante.", status: 403 };
    }
    return { id: user.id, role: user.role, plan: user.plan };
}

export const assistantController = {
    async byPhone(req: Request, res: Response) {
        const phone = String(req.query.phone ?? "");
        const user = await findUserByPhoneUsecase(userRepository, phone);
        if (!user) {
            res.status(404).json({ error: "Usuário não encontrado." });
            return;
        }
        res.json(serialize(user));
    },

    async profile(req: Request, res: Response) {
        const user = await userRepository.findById(req.params.userId as string);
        if (!user) {
            res.status(404).json({ error: "Usuário não encontrado." });
            return;
        }
        res.json(serialize({ id: user.id, name: user.name, plan: user.plan, companyName: user.companyName }));
    },

    async dashboard(req: Request, res: Response) {
        const data = await getDashboardUsecase(orderRepository, clientRepository, req.params.userId as string);
        res.json(serialize(data));
    },

    async report(req: Request, res: Response) {
        const { start, end, status } = req.query;
        const data = await getReportUsecase(
            orderRepository,
            req.params.userId as string,
            String(start),
            String(end),
            status ? (String(status) as OrderStatus) : undefined,
        );
        res.json(serialize(data));
    },

    async searchClients(req: Request, res: Response) {
        const name = String(req.query.name ?? "");
        const clients = await findClientByNameUsecase(clientRepository, req.params.userId as string, name);
        res.json(serialize(clients));
    },

    async ordersByClient(req: Request, res: Response) {
        const orders = await listOrdersByClientUsecase(orderRepository, req.params.userId as string, req.params.clientId as string);
        res.json(serialize(orders));
    },

    async clientLink(req: Request, res: Response) {
        const client = await clientRepository.findById(req.params.clientId as string, req.params.userId as string);
        if (!client) {
            res.status(404).json({ error: "Cliente não encontrado." });
            return;
        }
        const url = `${process.env.FRONTEND_URL}/catalogo/${req.params.userId}/${req.params.clientId}`;
        res.json({ url });
    },

    async debts(req: Request, res: Response) {
        const gate = await requireDiamantePlan(req.params.userId as string);
        if ("error" in gate) {
            res.status(gate.status).json({ error: gate.error });
            return;
        }
        const debts = await listDebtsUsecase(debtRepository, req.params.userId as string, req.query);
        res.json(serialize(debts));
    },

    async expenses(req: Request, res: Response) {
        const gate = await requireDiamantePlan(req.params.userId as string);
        if ("error" in gate) {
            res.status(gate.status).json({ error: gate.error });
            return;
        }
        const expenses = await listExpensesUsecase(expenseRepository, req.params.userId as string, req.query);
        res.json(serialize(expenses));
    },

    async financialReport(req: Request, res: Response) {
        const gate = await requireDiamantePlan(req.params.userId as string);
        if ("error" in gate) {
            res.status(gate.status).json({ error: gate.error });
            return;
        }
        const { start, end } = req.query;
        const data = await getFinancialReportUsecase(
            orderRepository,
            expenseRepository,
            debtRepository,
            userRepository,
            cashMovementRepository,
            req.params.userId as string,
            String(start),
            String(end),
        );
        res.json(serialize(data));
    },

    async invoice(req: Request, res: Response) {
        const invoice = await getUserInvoiceUsecase(invoiceRepository, req.params.userId as string);
        if (!invoice) {
            res.status(404).json({ error: "Nenhuma fatura encontrada." });
            return;
        }
        res.json(serialize(invoice));
    },
};
