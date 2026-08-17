import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { prisma } from "../database/prisma";
import { sendMail } from "../email/mailer";
import { resetPasswordEmailTemplate, verificationEmailTemplate } from "../email/templates";
import { auditLogRepository } from "../repositories/audit-log.repository";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: (process.env.FRONTEND_URL ?? "http://localhost:6502").split(","),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    // Shares the session cookie across subdomains (api./gestao.) so the request stays
    // same-site — required for checkSession()'s SSR cookie-forwarding to see it at all.
    ...(process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN
        ? { advanced: { crossSubDomainCookies: { enabled: true, domain: process.env.COOKIE_DOMAIN }, useSecureCookies: true } }
        : {}),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            try {
                await sendMail(user.email, "Redefinir senha — Fluxy Gestão", resetPasswordEmailTemplate(user.name, url));
            } catch (err) {
                console.error("[auth] failed to send reset-password email:", err);
            }
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            try {
                await sendMail(user.email, "Confirme seu e-mail — Fluxy Gestão", verificationEmailTemplate(user.name, url));
            } catch (err) {
                console.error("[auth] failed to send verification email:", err);
            }
        },
    },
    user: {
        additionalFields: {
            // Obrigatórios no cadastro (ver signup.tsx) — necessários para gerar cobrança
            // via Asaas (exige cpfCnpj do cliente); sem isso o job de billing pula o
            // usuário na geração de fatura (ver ensure-asaas-customer.ts).
            phone: { type: "string", required: true },
            avatarUrl: { type: "string", required: false },
            theme: { type: "string", required: false, defaultValue: "light" },
            companyName: { type: "string", required: false },
            cnpj: { type: "string", required: false },
            cpf: { type: "string", required: true },
            cep: { type: "string", required: false },
            address: { type: "string", required: false },
            addressNumber: { type: "string", required: false },
            complement: { type: "string", required: false },
            neighborhood: { type: "string", required: false },
            city: { type: "string", required: false },
            state: { type: "string", required: false },
            logoUrl: { type: "string", required: false },
            primaryColor: { type: "string", required: false, defaultValue: "#8c52ff" },
            pdfColor: { type: "string", required: false, defaultValue: "#8c52ff" },
            includeLogoInPdf: { type: "boolean", required: false, defaultValue: true },
            // Plano único — mantido apenas para referência de billing. Não editável pelo cliente.
            plan: { type: "string", required: false, defaultValue: "mensal", input: false },
            // Set only by the daily billing job (invoice overdue) / cleared when payment
            // is confirmed. Not client-settable.
            billingBlocked: { type: "boolean", required: false, defaultValue: false, input: false },
        },
    },
    plugins: [admin()],
    databaseHooks: {
        session: {
            create: {
                after: async (session) => {
                    await auditLogRepository.create({
                        userId: session.userId,
                        about: "Login realizado",
                        type: "LOGIN",
                    });
                },
            },
            delete: {
                after: async (session) => {
                    await auditLogRepository.create({
                        userId: session.userId,
                        about: "Logout realizado",
                        type: "LOGOUT",
                    });
                },
            },
        },
    },
});