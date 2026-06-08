-- CreateEnum
CREATE TYPE "ParliamentarianStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LICENSED', 'REMOVED');

-- CreateTable
CREATE TABLE "political_parties" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "ideology" TEXT,
    "flagUrl" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "political_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parliamentarians" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantUserId" TEXT NOT NULL,
    "politicalPartyId" TEXT,
    "parliamentaryName" TEXT NOT NULL,
    "officeNumber" TEXT,
    "photoUrl" TEXT,
    "biography" TEXT,
    "status" "ParliamentarianStatus" NOT NULL DEFAULT 'ACTIVE',
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parliamentarians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "political_parties_tenantId_idx" ON "political_parties"("tenantId");

-- CreateIndex
CREATE INDEX "political_parties_tenantId_isRemoved_idx" ON "political_parties"("tenantId", "isRemoved");

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_tenantId_acronym_key" ON "political_parties"("tenantId", "acronym");

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_tenantId_name_key" ON "political_parties"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "parliamentarians_tenantUserId_key" ON "parliamentarians"("tenantUserId");

-- CreateIndex
CREATE INDEX "parliamentarians_tenantId_idx" ON "parliamentarians"("tenantId");

-- CreateIndex
CREATE INDEX "parliamentarians_tenantId_status_idx" ON "parliamentarians"("tenantId", "status");

-- CreateIndex
CREATE INDEX "parliamentarians_tenantId_politicalPartyId_idx" ON "parliamentarians"("tenantId", "politicalPartyId");

-- CreateIndex
CREATE INDEX "parliamentarians_tenantId_isRemoved_idx" ON "parliamentarians"("tenantId", "isRemoved");

-- CreateIndex
CREATE UNIQUE INDEX "parliamentarians_tenantId_tenantUserId_key" ON "parliamentarians"("tenantId", "tenantUserId");

-- AddForeignKey
ALTER TABLE "political_parties" ADD CONSTRAINT "political_parties_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarians" ADD CONSTRAINT "parliamentarians_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarians" ADD CONSTRAINT "parliamentarians_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "tenant_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarians" ADD CONSTRAINT "parliamentarians_politicalPartyId_fkey" FOREIGN KEY ("politicalPartyId") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
