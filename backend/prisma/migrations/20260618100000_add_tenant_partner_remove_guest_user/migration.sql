-- Migration M10: TenantPartner e TenantPartnerUser
-- Substitui GuestUser (removido) e AutorExterno (renomeado para TenantPartner)

-- T-01: User.cpf nullable
ALTER TABLE "User" ALTER COLUMN "cpf" DROP NOT NULL;

-- T-02: Criar TenantPartner
CREATE TABLE "tenant_partners" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tipoAutorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "instituicao" TEXT,
    "cpf" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "registro" TEXT,
    "partido" TEXT,
    "uf" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_partners_pkey" PRIMARY KEY ("id")
);

-- T-03: Criar TenantPartnerUser
CREATE TABLE "tenant_partner_users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantPartnerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_partner_users_pkey" PRIMARY KEY ("id")
);

-- Indexes para TenantPartner
CREATE INDEX "tenant_partners_tenantId_idx" ON "tenant_partners"("tenantId");
CREATE INDEX "tenant_partners_tenantId_isRemoved_idx" ON "tenant_partners"("tenantId", "isRemoved");

-- Indexes para TenantPartnerUser
CREATE UNIQUE INDEX "tenant_partner_users_tenantPartnerId_key" ON "tenant_partner_users"("tenantPartnerId");
CREATE UNIQUE INDEX "tenant_partner_users_userId_key" ON "tenant_partner_users"("userId");
CREATE INDEX "tenant_partner_users_tenantId_idx" ON "tenant_partner_users"("tenantId");
CREATE INDEX "tenant_partner_users_tenantId_isRemoved_idx" ON "tenant_partner_users"("tenantId", "isRemoved");

-- FKs para TenantPartner
ALTER TABLE "tenant_partners" ADD CONSTRAINT "tenant_partners_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant_partners" ADD CONSTRAINT "tenant_partners_tipoAutorId_fkey" FOREIGN KEY ("tipoAutorId") REFERENCES "TipoAutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FKs para TenantPartnerUser
ALTER TABLE "tenant_partner_users" ADD CONSTRAINT "tenant_partner_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant_partner_users" ADD CONSTRAINT "tenant_partner_users_tenantPartnerId_fkey" FOREIGN KEY ("tenantPartnerId") REFERENCES "tenant_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tenant_partner_users" ADD CONSTRAINT "tenant_partner_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- T-04a: Migrar dados de autores_externos para tenant_partners (preservando IDs)
INSERT INTO "tenant_partners" ("id", "tenantId", "tipoAutorId", "nome", "cargo", "instituicao", "cpf", "email", "telefone", "registro", "partido", "uf", "isRemoved", "removedAt", "createdAt", "updatedAt")
SELECT "id", "tenantId", "tipoAutorId", "nome", "cargo", "instituicao", "cpf", "email", "telefone", "registro", "partido", "uf", "isRemoved", "removedAt", "createdAt", "updatedAt"
FROM "autores_externos";

-- T-04b: Adicionar coluna tenantPartnerId em Autor
ALTER TABLE "Autor" ADD COLUMN "tenantPartnerId" TEXT;

-- T-04c: Migrar FK: Autor.tenantPartnerId = Autor.autorExternoId (IDs são os mesmos)
UPDATE "Autor" SET "tenantPartnerId" = "autorExternoId" WHERE "autorExternoId" IS NOT NULL;

-- T-04d: Remover FKs e indexes antigos de Autor
DROP INDEX IF EXISTS "Autor_tenantId_autorExternoId_idx";
DROP INDEX IF EXISTS "Autor_tenantId_guestUserId_idx";

ALTER TABLE "Autor" DROP CONSTRAINT IF EXISTS "Autor_autorExternoId_fkey";
ALTER TABLE "Autor" DROP CONSTRAINT IF EXISTS "Autor_guestUserId_fkey";

-- T-04e: Remover colunas antigas de Autor
ALTER TABLE "Autor" DROP COLUMN IF EXISTS "autorExternoId";
ALTER TABLE "Autor" DROP COLUMN IF EXISTS "guestUserId";

-- T-04f: Adicionar index e FK do tenantPartnerId em Autor
CREATE INDEX "Autor_tenantId_tenantPartnerId_idx" ON "Autor"("tenantId", "tenantPartnerId");
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_tenantPartnerId_fkey" FOREIGN KEY ("tenantPartnerId") REFERENCES "tenant_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- T-05/T-06: Remover autores_externos (dados já migrados acima)
ALTER TABLE "autores_externos" DROP CONSTRAINT IF EXISTS "autores_externos_tenantId_fkey";
ALTER TABLE "autores_externos" DROP CONSTRAINT IF EXISTS "autores_externos_tipoAutorId_fkey";
DROP TABLE IF EXISTS "autores_externos";

-- T-06: Remover guest_users (sem migração de dados — guest_users sem autores vinculados são descartados)
ALTER TABLE "guest_users" DROP CONSTRAINT IF EXISTS "guest_users_tenantId_fkey";
DROP TABLE IF EXISTS "guest_users";

-- T-06: Remover enums legados
DROP TYPE IF EXISTS "GuestUserType";
DROP TYPE IF EXISTS "GuestUserStatus";
