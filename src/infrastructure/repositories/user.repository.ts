import { prisma } from "../database/prisma";
import type { UserRepository } from "../../domain/repository/user.repository";

// Normaliza para DDD + 8 dígitos locais, removendo DDI (55) e o 9º dígito do celular
// quando presentes — ambos opcionais e inconsistentes entre as fontes: o telefone
// salvo no perfil (mascarado, sem DDI) costuma ter o 9, enquanto o wa_id que a Meta
// envia tem DDI e às vezes vem sem o 9 (número normalizado pela operadora/Meta).
function normalizePhone(phone: string): string {
    let digits = phone.replace(/\D/g, "");
    if (digits.length >= 12) {
        digits = digits.slice(-(digits.length - 2)); // remove o DDI (ex: 55)
    }
    if (digits.length === 11) {
        digits = digits.slice(0, 2) + digits.slice(3); // remove o 9º dígito do celular
    }
    return digits;
}

export const userRepository: UserRepository = {
    findById(id) {
        return prisma.user.findUnique({ where: { id } });
    },

    async findByPhone(phone) {
        const target = normalizePhone(phone);
        if (!target) return null;

        const candidates = await prisma.user.findMany({ where: { phone: { not: null } } });
        return candidates.find((u) => normalizePhone(u.phone as string) === target) ?? null;
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
