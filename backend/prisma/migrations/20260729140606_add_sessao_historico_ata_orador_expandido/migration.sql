-- CreateEnum
CREATE TYPE "TipoEventoSessaoHistorico" AS ENUM ('SESSAO_ABERTA', 'SESSAO_SUSPENSA', 'SESSAO_ENCERRADA', 'SESSAO_CANCELADA', 'FASE_ALTERADA', 'CHAMADA_REALIZADA', 'CHAMADA_REINICIADA', 'PRESENCA_REGISTRADA', 'VOTACAO_ABERTA', 'VOTACAO_ENCERRADA', 'PEDIDO_PALAVRA_CRIADO', 'PEDIDO_PALAVRA_RESPONDIDO', 'ATA_GERADA', 'ATA_APROVADA');

-- CreateEnum
CREATE TYPE "StatusAta" AS ENUM ('RASCUNHO', 'APROVADA', 'PUBLICADA');

-- DropForeignKey
ALTER TABLE "PautaItem" DROP CONSTRAINT "PautaItem_materiaId_fkey";

-- DropForeignKey
ALTER TABLE "matter_coauthors" DROP CONSTRAINT "matter_coauthors_parliamentarianId_fkey";

-- DropForeignKey
ALTER TABLE "matter_coauthors" DROP CONSTRAINT "matter_coauthors_tenantPartnerId_fkey";

-- AlterTable
ALTER TABLE "PautaItem" ADD COLUMN     "ataReferenciadaId" TEXT;

-- AlterTable
ALTER TABLE "pedidos_palavra" ADD COLUMN     "fase" "FaseSessao",
ADD COLUMN     "tema" TEXT,
ADD COLUMN     "tempoConcedidoSegundos" INTEGER;

-- CreateTable
CREATE TABLE "sessao_historico" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "tipoEvento" "TipoEventoSessaoHistorico" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" TEXT,
    "descricao" TEXT,
    "metadataJson" JSONB,

    CONSTRAINT "sessao_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessaoPlenariaId" TEXT NOT NULL,
    "status" "StatusAta" NOT NULL DEFAULT 'RASCUNHO',
    "conteudo" TEXT NOT NULL,
    "geradaAutomaticamente" BOOLEAN NOT NULL DEFAULT true,
    "aprovadaEm" TIMESTAMP(3),
    "aprovadaPorId" TEXT,
    "pdfUrl" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessao_historico_sessaoId_dataHora_idx" ON "sessao_historico"("sessaoId", "dataHora");

-- CreateIndex
CREATE INDEX "sessao_historico_sessaoId_tipoEvento_idx" ON "sessao_historico"("sessaoId", "tipoEvento");

-- CreateIndex
CREATE UNIQUE INDEX "atas_sessaoPlenariaId_key" ON "atas"("sessaoPlenariaId");

-- CreateIndex
CREATE INDEX "atas_tenantId_idx" ON "atas"("tenantId");

-- CreateIndex
CREATE INDEX "atas_tenantId_isRemoved_idx" ON "atas"("tenantId", "isRemoved");

-- CreateIndex
CREATE INDEX "PautaItem_ataReferenciadaId_idx" ON "PautaItem"("ataReferenciadaId");

-- AddForeignKey
ALTER TABLE "matter_coauthors" ADD CONSTRAINT "matter_coauthors_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matter_coauthors" ADD CONSTRAINT "matter_coauthors_tenantPartnerId_fkey" FOREIGN KEY ("tenantPartnerId") REFERENCES "tenant_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PautaItem" ADD CONSTRAINT "PautaItem_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PautaItem" ADD CONSTRAINT "PautaItem_ataReferenciadaId_fkey" FOREIGN KEY ("ataReferenciadaId") REFERENCES "atas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessao_historico" ADD CONSTRAINT "sessao_historico_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessao_historico" ADD CONSTRAINT "sessao_historico_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_sessaoPlenariaId_fkey" FOREIGN KEY ("sessaoPlenariaId") REFERENCES "SessaoPlenaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atas" ADD CONSTRAINT "atas_aprovadaPorId_fkey" FOREIGN KEY ("aprovadaPorId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
