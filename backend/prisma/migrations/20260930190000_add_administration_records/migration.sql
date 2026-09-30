CREATE TYPE "SacramentType" AS ENUM ('BAPTISM','CONFIRMATION','FIRST_COMMUNION','MARRIAGE','ORDINATION','FUNERAL','OTHER');
CREATE TYPE "SacramentalActStatus" AS ENUM ('DRAFT','VALIDATED','CANCELLED');
CREATE TYPE "MarriageCaseStatus" AS ENUM ('DRAFT','DOCUMENTS_PENDING','READY','PUBLISHED','CELEBRATED','CANCELLED');

CREATE TABLE "sacramental_acts" (
  "id" TEXT NOT NULL,
  "parishId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "type" "SacramentType" NOT NULL,
  "status" "SacramentalActStatus" NOT NULL DEFAULT 'DRAFT',
  "celebrationDate" TIMESTAMP(3) NOT NULL,
  "place" TEXT,
  "celebrantName" TEXT,
  "registerNumber" TEXT,
  "certificateNumber" TEXT,
  "notes" TEXT,
  "annotations" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sacramental_acts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "sacramental_acts_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "sacramental_acts_personId_fkey" FOREIGN KEY ("personId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "sacramental_acts_parishId_idx" ON "sacramental_acts"("parishId");
CREATE INDEX "sacramental_acts_personId_idx" ON "sacramental_acts"("personId");
CREATE INDEX "sacramental_acts_type_idx" ON "sacramental_acts"("type");
CREATE INDEX "sacramental_acts_celebrationDate_idx" ON "sacramental_acts"("celebrationDate");

CREATE TABLE "marriage_cases" (
  "id" TEXT NOT NULL,
  "parishId" TEXT NOT NULL,
  "groomName" TEXT NOT NULL,
  "brideName" TEXT NOT NULL,
  "celebrationDate" TIMESTAMP(3) NOT NULL,
  "celebrationTime" TEXT,
  "celebrantName" TEXT,
  "status" "MarriageCaseStatus" NOT NULL DEFAULT 'DRAFT',
  "groomDocuments" INTEGER NOT NULL DEFAULT 0,
  "brideDocuments" INTEGER NOT NULL DEFAULT 0,
  "requiredDocuments" INTEGER NOT NULL DEFAULT 3,
  "publicationCount" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "marriage_cases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "marriage_cases_parishId_fkey" FOREIGN KEY ("parishId") REFERENCES "parishes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "marriage_cases_parishId_idx" ON "marriage_cases"("parishId");
CREATE INDEX "marriage_cases_celebrationDate_idx" ON "marriage_cases"("celebrationDate");
CREATE INDEX "marriage_cases_status_idx" ON "marriage_cases"("status");
