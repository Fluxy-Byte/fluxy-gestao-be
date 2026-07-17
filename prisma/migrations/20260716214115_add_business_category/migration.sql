-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('STANDARD', 'HAIRDRESSER', 'LAB', 'PETSHOP');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "businessCategory" "BusinessCategory" NOT NULL DEFAULT 'STANDARD';
