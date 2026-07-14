import type { CashMovement, CashMovementType } from "../../../generated/prisma/client";

export interface CreateCashMovementInput {
    type: CashMovementType;
    amount: number;
    description: string;
    occurredAt: Date;
}

export interface CashMovementRepository {
    findByDateRange(userId: string, start: Date, end: Date): Promise<CashMovement[]>;
    createMany(userId: string, movements: CreateCashMovementInput[]): Promise<void>;
}
