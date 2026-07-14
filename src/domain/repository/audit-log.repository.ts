import type { AuditLog, LogType } from "../../../generated/prisma/client";

export interface CreateAuditLogInput {
    userId?: string | null;
    about: string;
    type: LogType;
    entityId?: string | null;
    entityType?: string | null;
    metadata?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
    startDate?: Date;
    endDate?: Date;
    type?: LogType;
    userId?: string;
}

export interface AuditLogRepository {
    create(data: CreateAuditLogInput): Promise<AuditLog>;
    findMany(filters: AuditLogFilters): Promise<(AuditLog & { user: { name: string; email: string } | null })[]>;
    countInRange(filters: AuditLogFilters): Promise<number>;
}
