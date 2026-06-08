-- CreateEnum
CREATE TYPE "CommitteeMemberRole" AS ENUM ('PRESIDENT', 'RAPPORTEUR', 'MEMBER');

-- CreateTable
CREATE TABLE "committee_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "role" "CommitteeMemberRole" NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committee_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "committee_members_committeeId_parliamentarianId_key" ON "committee_members"("committeeId", "parliamentarianId");

-- CreateIndex
CREATE INDEX "committee_members_tenantId_committeeId_idx" ON "committee_members"("tenantId", "committeeId");

-- CreateIndex
CREATE INDEX "committee_members_tenantId_isRemoved_idx" ON "committee_members"("tenantId", "isRemoved");

-- CreateIndex
CREATE INDEX "committee_members_committeeId_role_idx" ON "committee_members"("committeeId", "role");

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_members" ADD CONSTRAINT "committee_members_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
