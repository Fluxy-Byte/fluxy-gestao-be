import type { ClientRepository } from "../../../domain/repository/client.repository";

// Não existe busca por nome no ClientRepository — a base é por tenant (userId), tende
// a ser pequena, então filtrar em memória é suficiente. Retorna todos os matches para
// o chamador (o assistente Fly) decidir se precisa pedir para o usuário desambiguar.
export async function findClientByNameUsecase(repo: ClientRepository, userId: string, name: string) {
    const needle = name.trim().toLowerCase();
    const clients = await repo.findAllByUser(userId);
    return clients.filter((c) => c.active && c.name.toLowerCase().includes(needle));
}
