import type { User } from "../../../../generated/prisma/client";
import type { UserRepository } from "../../../domain/repository/user.repository";
import { createAsaasCustomer } from "../../../infrastructure/payment/asaas.client";

export async function ensureAsaasCustomer(userRepo: UserRepository, user: User): Promise<string> {
    if (user.asaasCustomerId) return user.asaasCustomerId;

    const cpfCnpj = (user.cnpj || user.cpf || "").replace(/\D/g, "");
    if (!cpfCnpj) {
        throw new Error(`Usuário ${user.id} sem CPF/CNPJ cadastrado — não é possível gerar cobrança.`);
    }

    const customer = await createAsaasCustomer({
        name: user.companyName || user.name,
        email: user.email,
        cpfCnpj,
        phone: user.phone,
    });
    await userRepo.setAsaasCustomerId(user.id, customer.id);
    return customer.id;
}
