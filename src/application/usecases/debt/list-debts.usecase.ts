import type { DebtRepository } from "../../../domain/repository/debt.repository";
import { listDebtsQuerySchema } from "../../../domain/validation/debt.schema";

export function listDebtsUsecase(repo: DebtRepository, userId: string, query: unknown) {
    const { start, end, status } = listDebtsQuerySchema.parse(query);
    return repo.findAllByUser(userId, {
        start: start ? new Date(`${start}T00:00:00`) : undefined,
        end: end ? new Date(`${end}T23:59:59`) : undefined,
        status,
    });
}
