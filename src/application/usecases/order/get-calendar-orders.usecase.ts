import type { OrderRepository } from "../../../domain/repository/order.repository";
import type { ClientRepository } from "../../../domain/repository/client.repository";

// Alimenta o calendário de OS do dashboard: todas as OS (qualquer status) cuja
// data de ENTREGA cai dentro do intervalo [start, end] — é a data que o cliente
// combina para retirar/receber o serviço, por isso é ela que organiza a agenda
// (não a data de entrada/criação da OS).
export async function getCalendarOrdersUsecase(
    orderRepo: OrderRepository,
    clientRepo: ClientRepository,
    userId: string,
    start: string,
    end: string,
) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T23:59:59`);

    const [orders, clients] = await Promise.all([
        orderRepo.findByDeliveryDateRange(userId, startDate, endDate),
        clientRepo.findAllByUser(userId),
    ]);
    const clientMap = new Map(clients.map((c) => [c.id, c.name]));

    return orders.map((o) => ({ ...o, clientName: clientMap.get(o.clientId) ?? "—" }));
}
