import { prisma } from "../database/prisma";
import type {
    ClientRepository,
    CreateClientInput,
    UpdateClientInput,
} from "../../domain/repository/client.repository";

export const clientRepository: ClientRepository = {
    findAllByUser(userId) {
        return prisma.client.findMany({
            where: { userId, deletedAt: null },
            orderBy: { name: "asc" },
        });
    },

    findById(id, userId) {
        return prisma.client.findFirst({ where: { id, userId, deletedAt: null } });
    },

    create(userId, data: CreateClientInput) {
        return prisma.client.create({
            data: { ...data, userId },
        });
    },

    update(id, userId, data: UpdateClientInput) {
        return prisma.client.update({
            where: { id, userId },
            data,
        });
    },

    async softDelete(id, userId) {
        await prisma.client.update({
            where: { id, userId },
            data: { deletedAt: new Date() },
        });
    },
};
