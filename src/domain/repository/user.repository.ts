import type { User } from "../../../generated/prisma/client";

export interface UpdateProfileInput {
    name?: string;
    phone?: string | null;
    theme?: string;
}

export interface UpdateCompanyInput {
    companyName?: string | null;
    cnpj?: string | null;
    cpf?: string | null;
    phone?: string | null;
    cep?: string | null;
    address?: string | null;
    addressNumber?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    currentCash?: number;
}

export interface UpdateBrandInput {
    primaryColor?: string;
    pdfColor?: string;
    includeLogoInPdf?: boolean;
    logoUrl?: string;
}

export interface UserRepository {
    findById(id: string): Promise<User | null>;
    // Usado pelo assistente do WhatsApp (Fly) para identificar o usuário pelo número
    // que enviou a mensagem. `phone` não é @unique nem indexado, e o formato salvo no
    // perfil pode ter máscara diferente do wa_id do WhatsApp — a comparação é feita por
    // dígitos normalizados (últimos 11), não por igualdade exata de string.
    findByPhone(phone: string): Promise<User | null>;
    updateProfile(id: string, data: UpdateProfileInput): Promise<User>;
    updateCompany(id: string, data: UpdateCompanyInput): Promise<User>;
    updateBrand(id: string, data: UpdateBrandInput): Promise<User>;
    updatePlan(id: string, plan: string): Promise<User>;
    count(): Promise<number>;
    // Billing — usuários pagantes (role != admin) cadastrados antes do início do mês
    // corrente, ou seja, que já passaram do primeiro mês gratuito.
    findBillableBeforeMonth(monthStart: Date): Promise<User[]>;
    setAsaasCustomerId(id: string, asaasCustomerId: string): Promise<void>;
    setBillingBlocked(id: string, blocked: boolean): Promise<void>;
}
