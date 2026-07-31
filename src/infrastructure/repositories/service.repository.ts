import { prisma } from "../database/prisma";
import type {
    ServiceRepository,
    CreateServiceInput,
    UpdateServiceInput,
} from "../../domain/repository/service.repository";

export const serviceRepository: ServiceRepository = {
    findAllByUser(userId) {
        return prisma.service.findMany({
            where: { userId, deletedAt: null },
            orderBy: { name: "asc" },
        });
    },

    findActiveByUser(userId) {
        return prisma.service.findMany({
            where: { userId, deletedAt: null, active: true },
            orderBy: { name: "asc" },
        });
    },

    findCatalogVisibleByUser(userId) {
        return prisma.service.findMany({
            where: { userId, deletedAt: null, showInCatalog: true },
            orderBy: { name: "asc" },
        });
    },

    findById(id, userId) {
        return prisma.service.findFirst({ where: { id, userId, deletedAt: null } });
    },

    create(userId, data: CreateServiceInput) {
        return prisma.service.create({
            data: { ...data, userId },
        });
    },

    update(id, userId, data: UpdateServiceInput) {
        return prisma.service.update({
            where: { id, userId },
            data,
        });
    },

    async softDelete(id, userId) {
        await prisma.service.update({
            where: { id, userId },
            data: { deletedAt: new Date() },
        });
    },
};
