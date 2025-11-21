-- DropForeignKey
ALTER TABLE "batches" DROP CONSTRAINT "batches_departmentId_fkey";

-- AlterTable
ALTER TABLE "batches" ALTER COLUMN "departmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
