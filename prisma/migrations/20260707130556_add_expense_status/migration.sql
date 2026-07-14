-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "expense" ADD COLUMN     "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING';
