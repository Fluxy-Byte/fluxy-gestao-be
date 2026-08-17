-- AlterTable
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'mensal';

-- Não existe mais plano "Diamante" — plano único, renomeado para "mensal".
UPDATE "user" SET "plan" = 'mensal' WHERE "plan" != 'mensal';
