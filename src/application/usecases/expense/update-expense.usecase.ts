import type { ExpenseRepository, UpdateExpenseInput } from "../../../domain/repository/expense.repository";
import type { AuditLogRepository } from "../../../domain/repository/audit-log.repository";
import { updateExpenseSchema } from "../../../domain/validation/expense.schema";
import { recordAuditLog } from "../audit/record-audit-log.usecase";
import { reconcileCashForUser } from "../../../infrastructure/jobs/daily-cash-reconciliation.job";

export async function updateExpenseUsecase(
    repo: ExpenseRepository,
    auditRepo: AuditLogRepository,
    userId: string,
    id: string,
    input: UpdateExpenseInput,
) {
    const data = updateExpenseSchema.parse(input);
    const expense = await repo.update(id, userId, data);
    await recordAuditLog(auditRepo, {
        userId,
        about: `Despesa "${expense.description}" atualizada`,
        type: "UPDATE",
        entityId: expense.id,
        entityType: "Expense",
    });
    // Despesa que virou paga (ou já era paga e teve valor/data alterados) sai do caixa
    // na hora, sem esperar o botão manual.
    if (expense.status === "PAID") {
        await reconcileCashForUser(userId).catch((err) => console.error("[cash-reconciliation] falhou:", err));
    }
    return expense;
}
