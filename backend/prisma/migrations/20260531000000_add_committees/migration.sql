-- CreateEnum
CREATE TYPE "CommitteeType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "CommitteeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "committees" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "type" "CommitteeType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "CommitteeStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "committees_tenantId_acronym_key" ON "committees"("tenantId", "acronym");

-- CreateIndex
CREATE INDEX "committees_tenantId_idx" ON "committees"("tenantId");

-- CreateIndex
CREATE INDEX "committees_tenantId_type_idx" ON "committees"("tenantId", "type");

-- CreateIndex
CREATE INDEX "committees_tenantId_status_idx" ON "committees"("tenantId", "status");

-- CreateIndex
CREATE INDEX "committees_tenantId_isRemoved_idx" ON "committees"("tenantId", "isRemoved");

-- AddForeignKey
ALTER TABLE "committees" ADD CONSTRAINT "committees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
