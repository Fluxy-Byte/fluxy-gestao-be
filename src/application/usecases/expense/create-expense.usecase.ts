import type { CreateExpenseInput, ExpenseRepository } from "../../../domain/repository/expense.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { createExpenseSchema } from "../../../domain/validation/expense.schema";
import { recordAuditLog } from "../audit/record-audit-log.usecase";
import { reconcileCashForUser } from "../../../infrastructure/jobs/daily-cash-reconciliation.job";

export async function createExpenseUsecase(
    repo: ExpenseRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    input: CreateExpenseInput,
) {
    const data = createExpenseSchema.parse(input);
    const expense = await repo.create(userId, data);
    await recordAuditLog(auditRepo, {
        userId,
        about: `Despesa "${expense.description}" criada`,
        type: "CREATE",
        entityId: expense.id,
        entityType: "Expense",
    });
    // Despesa já criada como paga sai do caixa na hora, sem esperar o botão manual.
    if (expense.status === "PAID") {
        await reconcileCashForUser(userId).catch((err) => console.error("[cash-reconciliation] falhou:", err));
    }
    return expense;
}
