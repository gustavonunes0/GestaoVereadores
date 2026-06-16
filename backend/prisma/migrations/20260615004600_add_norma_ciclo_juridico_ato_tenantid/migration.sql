-- AlterTable
ALTER TABLE "Ato" ADD COLUMN     "anexoUrl" TEXT,
ADD COLUMN     "dataAto" TIMESTAMP(3),
ADD COLUMN     "ementa" TEXT,
ADD COLUMN     "identificadorId" TEXT,
ADD COLUMN     "isRemoved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "removedAt" TIMESTAMP(3),
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "textoUrl" TEXT;

-- AlterTable
ALTER TABLE "Norma" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "complementar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataPromulgacao" TIMESTAMP(3),
ADD COLUMN     "dataPublicacao" TIMESTAMP(3),
ADD COLUMN     "dataRevogacao" TIMESTAMP(3),
ADD COLUMN     "dataSancao" TIMESTAMP(3),
ADD COLUMN     "dataVeto" TIMESTAMP(3),
ADD COLUMN     "dataVigencia" TIMESTAMP(3),
ADD COLUMN     "motivoVeto" TEXT,
ADD COLUMN     "normaRevoganteId" TEXT,
ADD COLUMN     "textoIntegralUrl" TEXT,
ADD COLUMN     "textoUrl" TEXT,
ADD COLUMN     "tipoVeto" TEXT;

-- CreateIndex
CREATE INDEX "Ato_tenantId_idx" ON "Ato"("tenantId");

-- CreateIndex
CREATE INDEX "Ato_tenantId_isRemoved_idx" ON "Ato"("tenantId", "isRemoved");

-- AddForeignKey
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_normaRevoganteId_fkey" FOREIGN KEY ("normaRevoganteId") REFERENCES "Norma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ato" ADD CONSTRAINT "Ato_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ato" ADD CONSTRAINT "Ato_identificadorId_fkey" FOREIGN KEY ("identificadorId") REFERENCES "IdentificadorNorma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
