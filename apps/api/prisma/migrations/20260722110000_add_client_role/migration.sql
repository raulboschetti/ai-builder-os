-- AlterEnum
ALTER TYPE "MembershipRole" ADD VALUE 'CLIENT';

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN "clientProjectId" TEXT;

-- AlterTable
ALTER TABLE "Invitation" ADD COLUMN "projectId" TEXT;

-- CreateIndex
CREATE INDEX "Membership_clientProjectId_idx" ON "Membership"("clientProjectId");

-- CreateIndex
CREATE INDEX "Invitation_projectId_idx" ON "Invitation"("projectId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_clientProjectId_fkey" FOREIGN KEY ("clientProjectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
