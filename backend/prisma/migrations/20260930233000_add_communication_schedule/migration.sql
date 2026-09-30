ALTER TABLE "communications" ADD COLUMN "scheduledAt" TIMESTAMP(3);
CREATE INDEX "communications_scheduledAt_idx" ON "communications"("scheduledAt");
