-- CreateTable
CREATE TABLE "TipoComissao" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoComissao_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Comissao" ADD COLUMN "sigla" TEXT,
ADD COLUMN "tipoComissaoId" TEXT,
ADD COLUMN "dataCriacao" TIMESTAMP(3),
ADD COLUMN "dataExtincao" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "TipoComissao_tenantId_nome_key" ON "TipoComissao"("tenantId", "nome");
CREATE INDEX "TipoComissao_tenantId_idx" ON "TipoComissao"("tenantId");
CREATE UNIQUE INDEX "Comissao_tenantId_sigla_key" ON "Comissao"("tenantId", "sigla");

-- AddForeignKey
ALTER TABLE "TipoComissao" ADD CONSTRAINT "TipoComissao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_tipoComissaoId_fkey" FOREIGN KEY ("tipoComissaoId") REFERENCES "TipoComissao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
