import { prisma } from "../database/prisma";
import type { UserRepository } from "../../domain/repository/user.repository";

export const userRepository: UserRepository = {
    findById(id) {
        return prisma.user.findUnique({ where: { id } });
    },

    updateProfile(id, data) {
        return prisma.user.update({ where: { id }, data });
    },

    updateCompany(id, data) {
        // Ao redefinir o valor de caixa manualmente, o baseline da conciliação avança
        // para agora — evita somar de novo, sobre o novo valor, atividade anterior a
        // este ajuste manual.
        return prisma.user.update({
            where: { id },
            data: {
                ...data,
                ...(data.currentCash !== undefined ? { cashReconciledAt: new Date() } : {}),
            },
        });
    },

    updateBrand(id, data) {
        return prisma.user.update({ where: { id }, data });
    },

    updatePlan(id, plan) {
        return prisma.user.update({ where: { id }, data: { plan } });
    },

    count() {
        return prisma.user.count();
    },

    findBillableBeforeMonth(monthStart) {
        return prisma.user.findMany({ where: { role: { not: "admin" }, createdAt: { lt: monthStart } } });
    },

    async setAsaasCustomerId(id, asaasCustomerId) {
        await prisma.user.update({ where: { id }, data: { asaasCustomerId } });
    },

    async setBillingBlocked(id, blocked) {
        await prisma.user.update({ where: { id }, data: { billingBlocked: blocked } });
    },
};
