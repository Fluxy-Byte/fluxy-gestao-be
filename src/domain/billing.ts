// Preço mensal por plano. Diamante está em promoção (valor cheio é R$60 — ver
// landing page), cobrando o mesmo valor do Plus por enquanto.
export const PLAN_PRICES: Record<string, number> = {
    plus: 40,
    diamante: 40,
};

export function planPrice(plan: string): number {
    return PLAN_PRICES[plan] ?? PLAN_PRICES.plus;
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
