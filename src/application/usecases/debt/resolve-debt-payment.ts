export type DebtPaymentStatus = "PENDING" | "PARTIAL" | "PAID";

// Mesma regra usada em Order: PAID quita o valor total, PARTIAL exige um valor
// entre 0 e o total, e qualquer outro caso zera o valor pago.
export function resolveDebtPayment(
    amount: number,
    input: { paymentStatus?: DebtPaymentStatus; amountPaid?: number },
): { paymentStatus: DebtPaymentStatus; amountPaid: number } {
    const paymentStatus = input.paymentStatus ?? "PENDING";

    if (paymentStatus === "PAID") {
        return { paymentStatus, amountPaid: amount };
    }
    if (paymentStatus === "PARTIAL") {
        if (input.amountPaid === undefined || input.amountPaid <= 0 || input.amountPaid >= amount) {
            throw new Error("Para pagamento parcial, o valor pago deve ser maior que zero e menor que o valor total da dívida.");
        }
        return { paymentStatus, amountPaid: input.amountPaid };
    }
    return { paymentStatus: "PENDING", amountPaid: 0 };
}
