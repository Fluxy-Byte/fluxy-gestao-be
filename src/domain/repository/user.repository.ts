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
