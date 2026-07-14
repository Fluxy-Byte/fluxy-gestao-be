import type { Request, Response } from "express";
import { expenseRepository } from "../../infrastructure/repositories/expense.repository";
import { orderRepository } from "../../infrastructure/repositories/order.repository";
import { debtRepository } from "../../infrastructure/repositories/debt.repository";
import { userRepository } from "../../infrastructure/repositories/user.repository";
import { auditLogRepository } from "../../infrastructure/repositories/audit-log.repository";
import { cashMovementRepository } from "../../infrastructure/repositories/cash-movement.repository";
import { listExpensesUsecase } from "../../application/usecases/expense/list-expenses.usecase";
import { createExpenseUsecase } from "../../application/usecases/expense/create-expense.usecase";
import { updateExpenseUsecase } from "../../application/usecases/expense/update-expense.usecase";
import { deleteExpenseUsecase } from "../../application/usecases/expense/delete-expense.usecase";
import { getFinancialReportUsecase } from "../../application/usecases/expense/get-financial-report.usecase";
import { reconcileCashForUser } from "../../infrastructure/jobs/daily-cash-reconciliation.job";
import { serialize } from "../serialize";

export const expenseController = {
    async list(req: Request, res: Response) {
        const expenses = await listExpensesUsecase(expenseRepository, req.userId, req.query);
        res.json(serialize(expenses));
    },

    async create(req: Request, res: Response) {
        const expense = await createExpenseUsecase(expenseRepository, auditLogRepository, req.userId, req.body);
        res.status(201).json(serialize(expense));
    },

    async update(req: Request, res: Response) {
        const expense = await updateExpenseUsecase(expenseRepository, auditLogRepository, req.userId, req.params.id as string, req.body);
        res.json(serialize(expense));
    },

    async remove(req: Request, res: Response) {
        await deleteExpenseUsecase(expenseRepository, auditLogRepository, req.userId, req.params.id as string);
        res.status(204).end();
    },

    async financialReport(req: Request, res: Response) {
        const { start, end } = req.query as { start: string; end: string };
        const data = await getFinancialReportUsecase(orderRepository, expenseRepository, debtRepository, userRepository, cashMovementRepository, req.userId, start, end);
        res.json(serialize(data));
    },

    async refreshCash(req: Request, res: Response) {
        const result = await reconcileCashForUser(req.userId);
        res.json(serialize(result));
    },
};
