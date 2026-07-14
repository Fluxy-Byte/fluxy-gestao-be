import type { Order } from "../../generated/prisma/client";

// Regra de negócio: dinheiro conta como faturamento assim que uma OS concluída é paga,
// total ou parcialmente. Para o valor de custo de uma OS com pagamento parcial, o custo
// real dos itens ainda não é totalmente conhecido/realizado — usa-se uma estimativa de
// 60% do valor já recebido como custo (os 40% restantes contribuem para a margem bruta).
export const PARTIAL_COST_RATIO = 0.6;

type CashOrder = Pick<Order, "paymentStatus" | "totalSale" | "totalCost" | "amountPaid">;

export function isCashReceivedOrder(o: Pick<Order, "statusOrder" | "paymentStatus">): boolean {
    return o.statusOrder === "COMPLETED" && (o.paymentStatus === "PAID" || o.paymentStatus === "PARTIAL");
}

export function cashRevenue(o: CashOrder): number {
    return o.paymentStatus === "PAID" ? Number(o.totalSale) : Number(o.amountPaid);
}

export function cashCost(o: CashOrder): number {
    return o.paymentStatus === "PAID" ? Number(o.totalCost) : Number(o.amountPaid) * PARTIAL_COST_RATIO;
}
