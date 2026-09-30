ALTER TABLE "marriage_cases"
  ADD COLUMN "groomBirthDate" TIMESTAMP(3),
  ADD COLUMN "brideBirthDate" TIMESTAMP(3),
  ADD COLUMN "groomPhone" TEXT,
  ADD COLUMN "bridePhone" TEXT,
  ADD COLUMN "groomAddress" TEXT,
  ADD COLUMN "brideAddress" TEXT,
  ADD COLUMN "groomBaptismStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "brideBaptismStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "groomConfirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "brideConfirmationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "preparationStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "civilStatusStatus" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "publication1Date" TIMESTAMP(3),
  ADD COLUMN "publication2Date" TIMESTAMP(3),
  ADD COLUMN "publication3Date" TIMESTAMP(3),
  ADD COLUMN "oppositionCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "oppositionNote" TEXT;

CREATE INDEX "marriage_cases_publicationCount_idx" ON "marriage_cases"("publicationCount");
