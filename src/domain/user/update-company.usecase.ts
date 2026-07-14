import type { UserRepository } from "../repository/user.repository";
import { updateCompanySchema } from "../validation/user.schema";

export function updateCompanyUsecase(repo: UserRepository, userId: string, input: unknown) {
    const data = updateCompanySchema.parse(input);
    return repo.updateCompany(userId, data);
}
