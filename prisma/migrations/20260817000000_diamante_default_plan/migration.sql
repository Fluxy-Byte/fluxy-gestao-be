-- AlterTable
ALTER TABLE "user" ALTER COLUMN "plan" SET DEFAULT 'diamante';

-- Plano único agora: todo mundo passa a ser "diamante".
UPDATE "user" SET "plan" = 'diamante' WHERE "plan" != 'diamante';
