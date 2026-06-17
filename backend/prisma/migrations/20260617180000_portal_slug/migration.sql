-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "portalSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_portalSlug_key" ON "Tenant"("portalSlug");
