-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WaStatus" ADD VALUE 'SENDING';
ALTER TYPE "WaStatus" ADD VALUE 'DEAD';

-- AlterTable
ALTER TABLE "WaLog" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nextRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "WaLog_status_nextRunAt_idx" ON "WaLog"("status", "nextRunAt");
