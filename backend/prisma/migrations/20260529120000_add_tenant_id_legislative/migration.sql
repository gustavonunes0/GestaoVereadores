-- Câmara demo para backfill de dados existentes
INSERT INTO "Tenant" ("id", "name", "cnpj", "status", "createdAt", "modifiedAt", "isRemoved")
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'Câmara Municipal de Teste',
  '00000000000191',
  'ACTIVE',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  false
)
ON CONFLICT ("id") DO NOTHING;

-- TipoMateria
ALTER TABLE "TipoMateria" ADD COLUMN "tenantId" TEXT;
UPDATE "TipoMateria" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "TipoMateria" ALTER COLUMN "tenantId" SET NOT NULL;
DROP INDEX IF EXISTS "TipoMateria_nome_key";
CREATE UNIQUE INDEX "TipoMateria_tenantId_nome_key" ON "TipoMateria"("tenantId", "nome");
CREATE INDEX "TipoMateria_tenantId_idx" ON "TipoMateria"("tenantId");
ALTER TABLE "TipoMateria" ADD CONSTRAINT "TipoMateria_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- TipoAutor
ALTER TABLE "TipoAutor" ADD COLUMN "tenantId" TEXT;
UPDATE "TipoAutor" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "TipoAutor" ALTER COLUMN "tenantId" SET NOT NULL;
DROP INDEX IF EXISTS "TipoAutor_nome_key";
CREATE UNIQUE INDEX "TipoAutor_tenantId_nome_key" ON "TipoAutor"("tenantId", "nome");
CREATE INDEX "TipoAutor_tenantId_idx" ON "TipoAutor"("tenantId");
ALTER TABLE "TipoAutor" ADD CONSTRAINT "TipoAutor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- TipoSessao
ALTER TABLE "TipoSessao" ADD COLUMN "tenantId" TEXT;
UPDATE "TipoSessao" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "TipoSessao" ALTER COLUMN "tenantId" SET NOT NULL;
DROP INDEX IF EXISTS "TipoSessao_nome_key";
CREATE UNIQUE INDEX "TipoSessao_tenantId_nome_key" ON "TipoSessao"("tenantId", "nome");
CREATE INDEX "TipoSessao_tenantId_idx" ON "TipoSessao"("tenantId");
ALTER TABLE "TipoSessao" ADD CONSTRAINT "TipoSessao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CargoMesa
ALTER TABLE "CargoMesa" ADD COLUMN "tenantId" TEXT;
UPDATE "CargoMesa" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "CargoMesa" ALTER COLUMN "tenantId" SET NOT NULL;
DROP INDEX IF EXISTS "CargoMesa_nome_key";
CREATE UNIQUE INDEX "CargoMesa_tenantId_nome_key" ON "CargoMesa"("tenantId", "nome");
CREATE INDEX "CargoMesa_tenantId_idx" ON "CargoMesa"("tenantId");
ALTER TABLE "CargoMesa" ADD CONSTRAINT "CargoMesa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Parlamentar
ALTER TABLE "Parlamentar" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Parlamentar" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Parlamentar" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "Parlamentar" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "Parlamentar_tenantId_idx" ON "Parlamentar"("tenantId");
ALTER TABLE "Parlamentar" ADD CONSTRAINT "Parlamentar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Legislatura
ALTER TABLE "Legislatura" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Legislatura" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Legislatura" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "Legislatura" ALTER COLUMN "tenantId" SET NOT NULL;
DROP INDEX IF EXISTS "Legislatura_numero_key";
CREATE UNIQUE INDEX "Legislatura_tenantId_numero_key" ON "Legislatura"("tenantId", "numero");
CREATE INDEX "Legislatura_tenantId_idx" ON "Legislatura"("tenantId");
ALTER TABLE "Legislatura" ADD CONSTRAINT "Legislatura_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Comissao
ALTER TABLE "Comissao" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Comissao" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Comissao" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "Comissao" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "Comissao_tenantId_idx" ON "Comissao"("tenantId");
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FrenteParlamentar
ALTER TABLE "FrenteParlamentar" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "FrenteParlamentar" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "FrenteParlamentar" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "FrenteParlamentar" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "FrenteParlamentar_tenantId_idx" ON "FrenteParlamentar"("tenantId");
ALTER TABLE "FrenteParlamentar" ADD CONSTRAINT "FrenteParlamentar_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Autor
ALTER TABLE "Autor" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Autor" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Autor" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "Autor" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "Autor_tenantId_idx" ON "Autor"("tenantId");
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SessaoPlenaria
ALTER TABLE "SessaoPlenaria" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "SessaoPlenaria" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "SessaoPlenaria" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "SessaoPlenaria" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "SessaoPlenaria_tenantId_idx" ON "SessaoPlenaria"("tenantId");
ALTER TABLE "SessaoPlenaria" ADD CONSTRAINT "SessaoPlenaria_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MesaDiretora
ALTER TABLE "MesaDiretora" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "MesaDiretora" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "MesaDiretora" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "MesaDiretora" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "MesaDiretora_tenantId_idx" ON "MesaDiretora"("tenantId");
ALTER TABLE "MesaDiretora" ADD CONSTRAINT "MesaDiretora_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Materia
ALTER TABLE "Materia" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Materia" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Materia" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "Materia" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "Materia_tenantId_idx" ON "Materia"("tenantId");
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Norma
ALTER TABLE "Norma" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Norma" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
UPDATE "Norma" SET "tenantId" = 'a0000000-0000-4000-8000-000000000001';
ALTER TABLE "Norma" ALTER COLUMN "tenantId" SET NOT NULL;
CREATE INDEX "Norma_tenantId_idx" ON "Norma"("tenantId");
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
