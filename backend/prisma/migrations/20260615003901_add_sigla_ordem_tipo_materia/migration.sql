-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "PautaItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TipoMateria" ADD COLUMN     "isRemoved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ordem" INTEGER,
ADD COLUMN     "removedAt" TIMESTAMP(3),
ADD COLUMN     "sigla" TEXT;

-- AlterTable
ALTER TABLE "tenant_users" RENAME CONSTRAINT "TenantUser_pkey" TO "tenant_users_pkey";

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "workloadHours" INTEGER NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "courses_tenantId_isRemoved_idx" ON "courses"("tenantId", "isRemoved");

-- CreateIndex
CREATE INDEX "courses_tenantId_status_idx" ON "courses"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "courses_tenantId_slug_key" ON "courses"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "TipoMateria_tenantId_isRemoved_idx" ON "TipoMateria"("tenantId", "isRemoved");

-- RenameForeignKey
ALTER TABLE "tenant_users" RENAME CONSTRAINT "TenantUser_tenantId_fkey" TO "tenant_users_tenantId_fkey";

-- RenameForeignKey
ALTER TABLE "tenant_users" RENAME CONSTRAINT "TenantUser_userId_fkey" TO "tenant_users_userId_fkey";

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "parliamentarian_mandates_tenantId_parliamentarianId_legislature" RENAME TO "parliamentarian_mandates_tenantId_parliamentarianId_legisla_key";

-- RenameIndex
ALTER INDEX "TenantUser_tenantId_idx" RENAME TO "tenant_users_tenantId_idx";

-- RenameIndex
ALTER INDEX "TenantUser_tenantId_userId_key" RENAME TO "tenant_users_tenantId_userId_key";

-- RenameIndex
ALTER INDEX "TenantUser_userId_idx" RENAME TO "tenant_users_userId_idx";
