import type { Expense } from "../../generated/prisma/client";

export function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

// Recurring expenses are stored as a single template row; this expands them into
// the actual occurrence dates that fall inside [start, end] (see schema.prisma).
export function occurrenceDatesInRange(expense: Expense, start: Date, end: Date): Date[] {
    if (!expense.isRecurring) return [expense.date];

    const rangeEnd = expense.recurrenceEndDate && expense.recurrenceEndDate < end ? expense.recurrenceEndDate : end;
    const dates: Date[] = [];
    let cursor = new Date(expense.date);
    while (cursor < start) cursor = addMonths(cursor, 1);
    while (cursor <= rangeEnd) {
        dates.push(new Date(cursor));
        cursor = addMonths(cursor, 1);
    }
    return dates;
}
