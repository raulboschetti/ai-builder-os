-- AlterTable
ALTER TABLE "ProjectAnalysis" ADD COLUMN "marketCostEstimate" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProjectAnalysis" ALTER COLUMN "marketCostEstimate" DROP DEFAULT;
