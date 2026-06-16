-- AlterTable
ALTER TABLE "AgendaLegislativa" ADD COLUMN     "comissaoId" TEXT,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "linkTransmissao" TEXT,
ADD COLUMN     "local" TEXT,
ADD COLUMN     "publicoExterno" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recorrencia" TEXT,
ADD COLUMN     "recorrenciaPaiId" TEXT,
ADD COLUMN     "sessaoPlenariaId" TEXT;

-- CreateIndex
CREATE INDEX "AgendaLegislativa_tenantId_sessaoPlenariaId_idx" ON "AgendaLegislativa"("tenantId", "sessaoPlenariaId");

-- AddForeignKey
ALTER TABLE "AgendaLegislativa" ADD CONSTRAINT "AgendaLegislativa_sessaoPlenariaId_fkey" FOREIGN KEY ("sessaoPlenariaId") REFERENCES "SessaoPlenaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaLegislativa" ADD CONSTRAINT "AgendaLegislativa_comissaoId_fkey" FOREIGN KEY ("comissaoId") REFERENCES "committees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaLegislativa" ADD CONSTRAINT "AgendaLegislativa_recorrenciaPaiId_fkey" FOREIGN KEY ("recorrenciaPaiId") REFERENCES "AgendaLegislativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
