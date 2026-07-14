import type { UserRepository } from "../repository/user.repository";
import { updateProfileSchema } from "../validation/user.schema";

export function updateProfileUsecase(repo: UserRepository, userId: string, input: unknown) {
    const data = updateProfileSchema.parse(input);
    return repo.updateProfile(userId, data);
}
