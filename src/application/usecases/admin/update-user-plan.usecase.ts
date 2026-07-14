import { z } from "zod";
import type { UserRepository } from "../../../domain/repository/user.repository";

const updateUserPlanSchema = z.object({
    plan: z.enum(["plus", "diamante"]),
});

export function updateUserPlanUsecase(repo: UserRepository, userId: string, input: unknown) {
    const { plan } = updateUserPlanSchema.parse(input);
    return repo.updatePlan(userId, plan);
}
