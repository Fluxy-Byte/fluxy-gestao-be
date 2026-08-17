// Preço mensal da assinatura — plano único.
export const SUBSCRIPTION_PRICE = 20;

export function planPrice(_plan: string): number {
    return SUBSCRIPTION_PRICE;
}

export function monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function lastDayOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function toAsaasDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export type InvoiceDisplayStatus = "paid" | "open" | "overdue";

export function invoiceDisplayStatus(status: string, dueDate: Date, now = new Date()): InvoiceDisplayStatus {
    if (status === "PAID") return "paid";
    return dueDate < now ? "overdue" : "open";
}
