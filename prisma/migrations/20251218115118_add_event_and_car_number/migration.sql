-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "carNumber" INTEGER;

-- AlterTable
ALTER TABLE "Penalty" ADD COLUMN     "event" TEXT NOT NULL DEFAULT 'race';
