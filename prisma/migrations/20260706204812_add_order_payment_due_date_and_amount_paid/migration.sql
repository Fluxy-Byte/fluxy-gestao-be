-- AlterTable
ALTER TABLE "order" ADD COLUMN     "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentDueDate" TIMESTAMP(3);
