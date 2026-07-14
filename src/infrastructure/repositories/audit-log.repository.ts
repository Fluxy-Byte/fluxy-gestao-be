import { prisma } from "../database/prisma";
import type { AuditLogFilters, AuditLogRepository, CreateAuditLogInput } from "../../domain/repository/audit-log.repository";
import { Prisma } from "../../../generated/prisma/client";

function whereFromFilters(filters: AuditLogFilters): Prisma.AuditLogWhereInput {
    return {
        ...(filters.userId ? { userId: filters.userId } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.startDate || filters.endDate
            ? {
                  createdAt: {
                      ...(filters.startDate ? { gte: filters.startDate } : {}),
                      ...(filters.endDate ? { lte: filters.endDate } : {}),
                  },
              }
            : {}),
    };
}

export const auditLogRepository: AuditLogRepository = {
    create(data: CreateAuditLogInput) {
        return prisma.auditLog.create({
            data: {
                userId: data.userId ?? null,
                about: data.about,
                type: data.type,
                entityId: data.entityId ?? null,
                entityType: data.entityType ?? null,
                metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
        });
    },

    findMany(filters) {
        return prisma.auditLog.findMany({
            where: whereFromFilters(filters),
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: "desc" },
            take: 200,
        });
    },

    countInRange(filters) {
        return prisma.auditLog.count({ where: whereFromFilters(filters) });
    },
};
