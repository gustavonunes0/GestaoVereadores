-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TenantPaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'WAIVED');

-- CreateEnum
CREATE TYPE "TenantPaymentMethod" AS ENUM ('PIX', 'BOLETO', 'TRANSFER', 'CARD', 'OTHER');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "tradeName" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "state" TEXT,
ADD COLUMN "contactName" TEXT,
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "contactPhone" TEXT,
ADD COLUMN "plan" "TenantPlan" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN "contractStartAt" TIMESTAMP(3),
ADD COLUMN "contractEndAt" TIMESTAMP(3),
ADD COLUMN "monthlyFeeCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "billingDay" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "maxParliamentarians" INTEGER,
ADD COLUMN "notes" TEXT;

-- CreateTable
CREATE TABLE "tenant_payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "competenceMonth" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "TenantPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "TenantPaymentMethod",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "tenant_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_payments_tenantId_competenceMonth_key" ON "tenant_payments"("tenantId", "competenceMonth");

-- CreateIndex
CREATE INDEX "tenant_payments_tenantId_status_idx" ON "tenant_payments"("tenantId", "status");

-- CreateIndex
CREATE INDEX "tenant_payments_tenantId_isRemoved_idx" ON "tenant_payments"("tenantId", "isRemoved");

-- AddForeignKey
ALTER TABLE "tenant_payments" ADD CONSTRAINT "tenant_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
