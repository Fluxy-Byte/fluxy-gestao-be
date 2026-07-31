import type { ClientRepository } from "../../../domain/repository/client.repository";
import type { ServiceRepository } from "../../../domain/repository/service.repository";
import type { UserRepository } from "../../../domain/repository/user.repository";
import { publicCatalogQuerySchema } from "../../../domain/validation/public-catalog.schema";

export async function getPublicCatalogUsecase(
    clientRepo: ClientRepository,
    serviceRepo: ServiceRepository,
    userRepo: UserRepository,
    input: unknown,
) {
    const { userId, clientId } = publicCatalogQuerySchema.parse(input);

    const [client, services, company] = await Promise.all([
        clientRepo.findById(clientId, userId),
        serviceRepo.findCatalogVisibleByUser(userId),
        userRepo.findById(userId),
    ]);

    if (!client) throw new Error("Cliente não encontrado.");

    const laborPct = Number(client.laborRate ?? 0);
    const items = services.map((s) => {
        const base = Number(s.salePrice ?? 0);
        const finalPrice = base * (1 + laborPct / 100);
        return {
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category,
            base_price: base,
            final_price: finalPrice,
        };
    });

    return {
        client: { id: client.id, name: client.name, labor_rate: laborPct },
        company: company
            ? {
                  company_name: company.companyName,
                  name: company.name,
                  logo_url: company.logoUrl,
                  primary_color: company.primaryColor,
                  phone: company.phone,
                  email: company.email,
              }
            : null,
        items,
    };
}
