-- CreateTable
CREATE TABLE "ProjectAnalysis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "viability" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyFeatures" TEXT[],
    "risks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectAnalysis_projectId_idx" ON "ProjectAnalysis"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectAnalysis" ADD CONSTRAINT "ProjectAnalysis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
