import type { ExpenseRepository } from "../../../domain/repository/expense.repository";
import type { OrderRepository } from "../../../domain/repository/order.repository";
import type { DebtRepository } from "../../../domain/repository/debt.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import type { CashMovementRepository } from "../../../domain/repository/cash-movement.repository";
import type { Expense } from "../../../../generated/prisma/client";
import { addMonths, occurrenceDatesInRange } from "../../../domain/expense-occurrences";
import { cashRevenue } from "../../../domain/order-cash";

function monthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
    const [y, m] = key.split("-").map(Number);
    const label = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" }).format(new Date(y, m - 1, 1));
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function expandOccurrences(expenses: Expense[], start: Date, end: Date) {
    const result: { date: Date; amount: number }[] = [];
    for (const e of expenses) {
        for (const date of occurrenceDatesInRange(e, start, end)) {
            result.push({ date, amount: Number(e.amount) });
        }
    }
    return result;
}

export async function getFinancialReportUsecase(
    orderRepo: OrderRepository,
    expenseRepo: ExpenseRepository,
    debtRepo: DebtRepository,
    userRepo: UserRepository,
    cashMovementRepo: CashMovementRepository,
    userId: string,
    start: string,
    end: string,
) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T23:59:59`);

    const now = new Date();
    const trailingStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const trailingEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [expenses, expensesTrailing, ordersTrailing, ordersInRange, debts, user, cashMovements] = await Promise.all([
        expenseRepo.findRelevantForRange(userId, startDate, endDate),
        expenseRepo.findRelevantForRange(userId, trailingStart, trailingEnd),
        // Por lastPaymentAt (não createdAt/completedAt): uma OS aberta fora da janela mas
        // paga dentro dela ainda deve contar como faturamento do mês em que pagou.
        orderRepo.findCashReceivedByDateRange(userId, trailingStart, trailingEnd),
        orderRepo.findCashReceivedByDateRange(userId, startDate, endDate),
        debtRepo.findAllByUser(userId),
        userRepo.findById(userId),
        cashMovementRepo.findByDateRange(userId, startDate, endDate),
    ]);

    // ----- Entrada de caixa no período selecionado -----
    const cashIn = ordersInRange.reduce((s, o) => s + cashRevenue(o), 0);

    // ----- Histórico de atualizações de caixa (entradas/saídas aplicadas pela
    // conciliação) no período selecionado -----
    const cashMovementHistory = cashMovements.map((m) => ({
        id: m.id,
        type: m.type,
        amount: Number(m.amount),
        description: m.description,
        occurredAt: m.occurredAt,
    }));

    // ----- Saída de caixa no período selecionado -----
    const expenseBreakdown = expenses.map((e) => {
        const occurrences = occurrenceDatesInRange(e, startDate, endDate).length;
        return {
            id: e.id,
            description: e.description,
            category: e.category,
            amount: Number(e.amount),
            status: e.status,
            isRecurring: e.isRecurring,
            occurrences,
            total: Number(e.amount) * occurrences,
        };
    });
    const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.total, 0);
    const totalPaidExpenses = expenseBreakdown
        .filter((e) => e.status === "PAID")
        .reduce((s, e) => s + e.total, 0);
    const totalPendingExpenses = expenseBreakdown
        .filter((e) => e.status === "PENDING")
        .reduce((s, e) => s + e.total, 0);

    // Saída de caixa por dia, dentro do período selecionado.
    const dayMap = new Map<string, number>();
    {
        const cursor = new Date(startDate);
        cursor.setHours(0, 0, 0, 0);
        const lastDay = new Date(endDate);
        lastDay.setHours(0, 0, 0, 0);
        while (cursor <= lastDay) {
            dayMap.set(cursor.toISOString().slice(0, 10), 0);
            cursor.setDate(cursor.getDate() + 1);
        }
    }
    for (const occ of expandOccurrences(expenses, startDate, endDate)) {
        const key = occ.date.toISOString().slice(0, 10);
        if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + occ.amount);
    }
    const expenseDailySeries = Array.from(dayMap.entries()).map(([date, value]) => ({ date: date.slice(5), value }));

    // ----- Faturamento x Saída de caixa, últimos 12 meses -----
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
    {
        let cursor = new Date(trailingStart);
        for (let i = 0; i < 12; i++) {
            monthlyMap.set(monthKey(cursor), { revenue: 0, expenses: 0 });
            cursor = addMonths(cursor, 1);
        }
    }
    for (const o of ordersTrailing) {
        if (!o.lastPaymentAt) continue;
        const bucket = monthlyMap.get(monthKey(new Date(o.lastPaymentAt)));
        if (bucket) bucket.revenue += cashRevenue(o);
    }
    for (const occ of expandOccurrences(expensesTrailing, trailingStart, trailingEnd)) {
        const bucket = monthlyMap.get(monthKey(occ.date));
        if (bucket) bucket.expenses += occ.amount;
    }
    const monthlySeries = Array.from(monthlyMap.entries()).map(([key, v]) => ({
        month: monthLabel(key),
        revenue: v.revenue,
        expenses: v.expenses,
    }));

    // ----- Dívidas existentes -----
    const totalDebtOutstanding = debts.reduce(
        (s, d) => s + Math.max(0, Number(d.amount) - Number(d.amountPaid)),
        0,
    );
    const debtMonthMap = new Map<string, number>();
    for (const d of debts) {
        const key = monthKey(new Date(d.date));
        debtMonthMap.set(key, (debtMonthMap.get(key) ?? 0) + Number(d.amount));
    }
    const topDebtMonths = Array.from(debtMonthMap.entries())
        .map(([key, total]) => ({ month: monthLabel(key), total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);

    return {
        cashIn,
        cashMovements: cashMovementHistory,
        totalExpenses,
        totalPaidExpenses,
        totalPendingExpenses,
        expenses: expenseBreakdown,
        expenseDailySeries,
        monthlySeries,
        totalDebtOutstanding,
        topDebtMonths,
        currentCash: Number(user?.currentCash ?? 0),
    };
}
