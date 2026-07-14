import type { ExpenseRepository } from "../../../domain/repository/expense.repository";
import { listExpensesQuerySchema } from "../../../domain/validation/expense.schema";

export function listExpensesUsecase(repo: ExpenseRepository, userId: string, query: unknown) {
    const { start, end, status } = listExpensesQuerySchema.parse(query);
    return repo.findAllByUser(userId, {
        start: start ? new Date(`${start}T00:00:00`) : undefined,
        end: end ? new Date(`${end}T23:59:59`) : undefined,
        status,
    });
}
