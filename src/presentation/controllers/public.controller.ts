import type { Request, Response } from "express";
import { clientRepository } from "../../infrastructure/repositories/client.repository";
import { serviceRepository } from "../../infrastructure/repositories/service.repository";
import { userRepository } from "../../infrastructure/repositories/user.repository";
import { getPublicCatalogUsecase } from "../../application/usecases/public/get-public-catalog.usecase";
import { serialize } from "../serialize";

export const publicController = {
    async catalog(req: Request, res: Response) {
        const data = await getPublicCatalogUsecase(clientRepository, serviceRepository, userRepository, req.query);
        res.json(serialize(data));
    },
};
