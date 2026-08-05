-- Domínios por tenant (resolução via Host / X-Tenant-Host)
CREATE TABLE "tenant_domains" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "primario" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_domains_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_domains_host_key" ON "tenant_domains"("host");
CREATE INDEX "tenant_domains_tenantId_idx" ON "tenant_domains"("tenantId");

ALTER TABLE "tenant_domains"
  ADD CONSTRAINT "tenant_domains_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
