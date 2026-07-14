import type { Request, Response } from "express";
import { debtRepository } from "../../infrastructure/repositories/debt.repository";
import { auditLogRepository } from "../../infrastructure/repositories/audit-log.repository";
import { listDebtsUsecase } from "../../application/usecases/debt/list-debts.usecase";
import { createDebtUsecase } from "../../application/usecases/debt/create-debt.usecase";
import { updateDebtUsecase } from "../../application/usecases/debt/update-debt.usecase";
import { deleteDebtUsecase } from "../../application/usecases/debt/delete-debt.usecase";
import { serialize } from "../serialize";

export const debtController = {
    async list(req: Request, res: Response) {
        const debts = await listDebtsUsecase(debtRepository, req.userId, req.query);
        res.json(serialize(debts));
    },

    async create(req: Request, res: Response) {
        const debt = await createDebtUsecase(debtRepository, auditLogRepository, req.userId, req.body);
        res.status(201).json(serialize(debt));
    },

    async update(req: Request, res: Response) {
        const debt = await updateDebtUsecase(debtRepository, auditLogRepository, req.userId, req.params.id as string, req.body);
        res.json(serialize(debt));
    },

    async remove(req: Request, res: Response) {
        await deleteDebtUsecase(debtRepository, auditLogRepository, req.userId, req.params.id as string);
        res.status(204).end();
    },
};
