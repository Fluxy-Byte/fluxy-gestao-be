import type { UserRepository } from "../repository/user.repository";
import { updateBrandSchema } from "../validation/user.schema";

export function updateBrandUsecase(repo: UserRepository, userId: string, input: unknown) {
    const data = updateBrandSchema.parse(input);
    return repo.updateBrand(userId, data);
}
