import type { BusinessCategory } from "../../generated/prisma/client";

// Cabeleireiro/PetShop agendam horário de atendimento (a OS carrega data + hora reais,
// escolhidas pelo usuário). Padrão/Laboratório só preveem uma data de entrega, sem
// horário — ver resolveDeliveryDate abaixo.
const SCHEDULING_CATEGORIES: BusinessCategory[] = ["HAIRDRESSER", "PETSHOP"];

export function usesScheduling(category: BusinessCategory): boolean {
    return SCHEDULING_CATEGORIES.includes(category);
}

// deliveryDate é sempre gravado como um instante completo (data + hora). Categorias com
// agenda (Cabeleireiro/PetShop) enviam o horário escolhido pelo usuário como está —
// espera-se um ISO com offset explícito (ex.: "2026-07-16T14:30:00-03:00"), pra não
// depender do fuso do servidor. Categorias sem agenda (Padrão/Laboratório) só escolhem a
// data; fixamos 08:00 (horário de Brasília) pra não deixar a OS com hora vazia/zerada.
export function resolveDeliveryDate(category: BusinessCategory, raw: string | null | undefined): string | null {
    if (!raw) return null;
    if (usesScheduling(category)) return raw;
    const datePart = raw.slice(0, 10);
    return `${datePart}T08:00:00-03:00`;
}
