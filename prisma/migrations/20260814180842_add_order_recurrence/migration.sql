-- AlterTable
ALTER TABLE "order" ADD COLUMN     "nextOccurrenceAt" TIMESTAMP(3),
ADD COLUMN     "recurMonthly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurWeekly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringParentId" TEXT;

-- CreateIndex
CREATE INDEX "order_nextOccurrenceAt_idx" ON "order"("nextOccurrenceAt");

-- CreateIndex
CREATE INDEX "order_recurringParentId_idx" ON "order"("recurringParentId");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_recurringParentId_fkey" FOREIGN KEY ("recurringParentId") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
