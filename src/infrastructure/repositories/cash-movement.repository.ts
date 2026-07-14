import { prisma } from "../database/prisma";
import type { CashMovementRepository, CreateCashMovementInput } from "../../domain/repository/cash-movement.repository";

export const cashMovementRepository: CashMovementRepository = {
    findByDateRange(userId, start, end) {
        return prisma.cashMovement.findMany({
            where: { userId, occurredAt: { gte: start, lte: end } },
            orderBy: { occurredAt: "desc" },
        });
    },

    async createMany(userId, movements: CreateCashMovementInput[]) {
        if (movements.length === 0) return;
        await prisma.cashMovement.createMany({
            data: movements.map((m) => ({
                userId,
                type: m.type,
                amount: m.amount,
                description: m.description,
                occurredAt: m.occurredAt,
            })),
        });
    },
};
