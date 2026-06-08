-- CreateEnum
CREATE TYPE "ParliamentaryFrontStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "parliamentary_fronts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "ParliamentaryFrontStatus" NOT NULL DEFAULT 'ACTIVE',
    "coordinatorParliamentarianId" TEXT,
    "createdByTenantUserId" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parliamentary_fronts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parliamentary_front_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "frontId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parliamentary_front_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parliamentary_fronts_tenantId_idx" ON "parliamentary_fronts"("tenantId");

-- CreateIndex
CREATE INDEX "parliamentary_fronts_tenantId_status_idx" ON "parliamentary_fronts"("tenantId", "status");

-- CreateIndex
CREATE INDEX "parliamentary_fronts_tenantId_theme_idx" ON "parliamentary_fronts"("tenantId", "theme");

-- CreateIndex
CREATE INDEX "parliamentary_fronts_tenantId_isRemoved_idx" ON "parliamentary_fronts"("tenantId", "isRemoved");

-- CreateIndex
CREATE UNIQUE INDEX "parliamentary_front_members_frontId_parliamentarianId_key" ON "parliamentary_front_members"("frontId", "parliamentarianId");

-- CreateIndex
CREATE INDEX "parliamentary_front_members_tenantId_frontId_idx" ON "parliamentary_front_members"("tenantId", "frontId");

-- CreateIndex
CREATE INDEX "parliamentary_front_members_tenantId_isRemoved_idx" ON "parliamentary_front_members"("tenantId", "isRemoved");

-- AddForeignKey
ALTER TABLE "parliamentary_fronts" ADD CONSTRAINT "parliamentary_fronts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentary_fronts" ADD CONSTRAINT "parliamentary_fronts_coordinatorParliamentarianId_fkey" FOREIGN KEY ("coordinatorParliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentary_fronts" ADD CONSTRAINT "parliamentary_fronts_createdByTenantUserId_fkey" FOREIGN KEY ("createdByTenantUserId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentary_front_members" ADD CONSTRAINT "parliamentary_front_members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentary_front_members" ADD CONSTRAINT "parliamentary_front_members_frontId_fkey" FOREIGN KEY ("frontId") REFERENCES "parliamentary_fronts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentary_front_members" ADD CONSTRAINT "parliamentary_front_members_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
