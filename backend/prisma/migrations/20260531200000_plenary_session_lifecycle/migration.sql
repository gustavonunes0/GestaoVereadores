-- CreateEnum
CREATE TYPE "CodigoTipoSessao" AS ENUM ('ORDINARIA', 'EXTRAORDINARIA', 'SOLENE', 'ESPECIAL');

-- AlterTable
ALTER TABLE "TipoSessao" ADD COLUMN "codigo" "CodigoTipoSessao";

-- AlterTable
ALTER TABLE "SessaoPlenaria" ADD COLUMN "dataFim" TIMESTAMP(3),
ADD COLUMN "cicloVidaJson" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "TipoSessao_tenantId_codigo_key" ON "TipoSessao"("tenantId", "codigo");
