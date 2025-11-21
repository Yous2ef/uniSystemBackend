/*
  Warnings:

  - Added the required column `batchId` to the `academic_terms` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TermStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- AlterTable: Add columns with temporary nullable state
ALTER TABLE "academic_terms" ADD COLUMN "batchId" TEXT;
ALTER TABLE "academic_terms" ADD COLUMN "status" "TermStatus" NOT NULL DEFAULT 'INACTIVE';

-- Assign all existing terms to the first batch (admin can reassign later)
UPDATE "academic_terms" 
SET "batchId" = (SELECT id FROM "batches" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "batchId" IS NULL;

-- Make batchId required
ALTER TABLE "academic_terms" ALTER COLUMN "batchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
