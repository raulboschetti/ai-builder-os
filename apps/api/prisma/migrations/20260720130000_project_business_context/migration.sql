-- CreateEnum
CREATE TYPE "ProjectBuildStage" AS ENUM ('INTAKE', 'ARCHITECTURE_GENERATED', 'BUILDING', 'DEPLOYED');

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN "businessVertical" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "buildStage" "ProjectBuildStage" NOT NULL DEFAULT 'INTAKE';
