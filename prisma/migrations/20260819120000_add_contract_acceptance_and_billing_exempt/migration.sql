-- AlterTable
ALTER TABLE "user" ADD COLUMN     "billingExempt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contractAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contractAcceptedAt" TIMESTAMP(3);
