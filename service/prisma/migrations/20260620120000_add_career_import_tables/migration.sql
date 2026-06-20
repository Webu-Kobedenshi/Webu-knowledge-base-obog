-- CreateEnum
CREATE TYPE "CareerImportBatchStatus" AS ENUM ('PREVIEWED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "CareerImportRowStatus" AS ENUM ('VALID', 'ERROR', 'PENDING_USER');

-- CreateTable
CREATE TABLE "CareerImportBatch" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "status" "CareerImportBatchStatus" NOT NULL DEFAULT 'PREVIEWED',
    "totalCount" INTEGER NOT NULL,
    "validCount" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "pendingCount" INTEGER NOT NULL,
    "overwriteCount" INTEGER NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "status" "CareerImportRowStatus" NOT NULL,
    "rawValues" JSONB NOT NULL,
    "normalizedValues" JSONB,
    "errors" TEXT[],
    "studentId" TEXT,
    "companyName" TEXT,
    "userId" TEXT,
    "alumniProfileId" TEXT,
    "willOverwrite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerImportBatch_adminUserId_createdAt_idx" ON "CareerImportBatch"("adminUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CareerImportRow_batchId_rowNumber_idx" ON "CareerImportRow"("batchId", "rowNumber");

-- CreateIndex
CREATE INDEX "CareerImportRow_studentId_idx" ON "CareerImportRow"("studentId");

-- AddForeignKey
ALTER TABLE "CareerImportBatch" ADD CONSTRAINT "CareerImportBatch_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerImportRow" ADD CONSTRAINT "CareerImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "CareerImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
