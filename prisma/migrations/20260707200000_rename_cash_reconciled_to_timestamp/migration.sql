-- AlterTable
ALTER TABLE "user" DROP COLUMN "cashReconciledDate",
ADD COLUMN     "cashReconciledAt" TIMESTAMP(3);
