import type { Request, Response } from "express";
import { userRepository } from "../../infrastructure/repositories/user.repository";
import { auditLogRepository } from "../../infrastructure/repositories/audit-log.repository";
import { getAdminMetricsUsecase } from "../../application/usecases/admin/get-admin-metrics.usecase";
import { getAuditLogUsecase } from "../../application/usecases/admin/get-audit-log.usecase";
import { updateUserPlanUsecase } from "../../application/usecases/admin/update-user-plan.usecase";
import { listOverdueUsersUsecase } from "../../application/usecases/admin/list-overdue-users.usecase";
import { invoiceRepository } from "../../infrastructure/repositories/invoice.repository";
import { serialize } from "../serialize";

export const adminController = {
    async metrics(req: Request, res: Response) {
        const data = await getAdminMetricsUsecase(userRepository, auditLogRepository, req.query);
        res.json(serialize(data));
    },

    async auditLog(req: Request, res: Response) {
        const logs = await getAuditLogUsecase(auditLogRepository, req.query);
        res.json(serialize(logs));
    },

    async updateUserPlan(req: Request, res: Response) {
        const user = await updateUserPlanUsecase(userRepository, req.params.id as string, req.body);
        res.json(serialize(user));
    },

    async overdueUsers(_req: Request, res: Response) {
        const users = await listOverdueUsersUsecase(invoiceRepository);
        res.json(serialize(users));
    },
};
