-- AlterTable
ALTER TABLE "Project" ADD COLUMN "whatsappNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_whatsappNumber_key" ON "Project"("whatsappNumber");
