-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "feeId" TEXT;

-- CreateTable
CREATE TABLE "movement_fees" (
    "id" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XOF',
    "dueDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movement_fees_movementId_idx" ON "movement_fees"("movementId");

-- CreateIndex
CREATE INDEX "movement_fees_active_idx" ON "movement_fees"("active");

-- CreateIndex
CREATE INDEX "payments_feeId_idx" ON "payments"("feeId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES "movement_fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_fees" ADD CONSTRAINT "movement_fees_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "movements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
