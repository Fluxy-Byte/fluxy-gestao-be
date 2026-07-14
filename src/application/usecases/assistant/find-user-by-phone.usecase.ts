import type { UserRepository } from "../../../domain/repository/user.repository";

export async function findUserByPhoneUsecase(userRepo: UserRepository, phone: string) {
    const user = await userRepo.findByPhone(phone);
    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        plan: user.plan,
        companyName: user.companyName,
    };
}
