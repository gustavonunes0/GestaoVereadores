-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('ACTIVE', 'FINISHED', 'INTERRUPTED', 'LICENSED');

-- CreateTable
CREATE TABLE "legislatures" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legislatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parliamentarian_mandates" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "legislatureId" TEXT NOT NULL,
    "partyAcronym" TEXT,
    "partyName" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "status" "MandateStatus" NOT NULL DEFAULT 'ACTIVE',
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parliamentarian_mandates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legislatures_tenantId_number_key" ON "legislatures"("tenantId", "number");

-- CreateIndex
CREATE INDEX "legislatures_tenantId_idx" ON "legislatures"("tenantId");

-- CreateIndex
CREATE INDEX "legislatures_tenantId_isCurrent_idx" ON "legislatures"("tenantId", "isCurrent");

-- CreateIndex
CREATE INDEX "legislatures_tenantId_isRemoved_idx" ON "legislatures"("tenantId", "isRemoved");

-- CreateIndex
CREATE UNIQUE INDEX "parliamentarian_mandates_tenantId_parliamentarianId_legislatureId_key" ON "parliamentarian_mandates"("tenantId", "parliamentarianId", "legislatureId");

-- CreateIndex
CREATE INDEX "parliamentarian_mandates_tenantId_parliamentarianId_idx" ON "parliamentarian_mandates"("tenantId", "parliamentarianId");

-- CreateIndex
CREATE INDEX "parliamentarian_mandates_tenantId_legislatureId_idx" ON "parliamentarian_mandates"("tenantId", "legislatureId");

-- CreateIndex
CREATE INDEX "parliamentarian_mandates_tenantId_status_idx" ON "parliamentarian_mandates"("tenantId", "status");

-- CreateIndex
CREATE INDEX "parliamentarian_mandates_tenantId_isRemoved_idx" ON "parliamentarian_mandates"("tenantId", "isRemoved");

-- AddForeignKey
ALTER TABLE "legislatures" ADD CONSTRAINT "legislatures_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarian_mandates" ADD CONSTRAINT "parliamentarian_mandates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarian_mandates" ADD CONSTRAINT "parliamentarian_mandates_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarian_mandates" ADD CONSTRAINT "parliamentarian_mandates_legislatureId_fkey" FOREIGN KEY ("legislatureId") REFERENCES "legislatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
