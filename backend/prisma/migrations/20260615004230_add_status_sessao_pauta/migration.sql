-- CreateEnum
CREATE TYPE "StatusSessao" AS ENUM ('AGENDADA', 'ABERTA', 'SUSPENSA', 'ENCERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusPautaItem" AS ENUM ('RASCUNHO', 'PUBLICADA', 'ENCERRADA');

-- AlterTable
ALTER TABLE "PautaItem" ADD COLUMN     "ordemDia" INTEGER,
ADD COLUMN     "publicadaEm" TIMESTAMP(3),
ADD COLUMN     "statusPauta" "StatusPautaItem" NOT NULL DEFAULT 'RASCUNHO';

-- AlterTable
ALTER TABLE "SessaoPlenaria" ADD COLUMN     "dataAbertura" TIMESTAMP(3),
ADD COLUMN     "dataEncerramento" TIMESTAMP(3),
ADD COLUMN     "dataSuspensao" TIMESTAMP(3),
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "quorumMinimo" INTEGER,
ADD COLUMN     "quorumPresente" INTEGER,
ADD COLUMN     "responsavelAberturaId" TEXT,
ADD COLUMN     "statusSessao" "StatusSessao" NOT NULL DEFAULT 'AGENDADA';

-- CreateIndex
CREATE INDEX "SessaoPlenaria_tenantId_statusSessao_idx" ON "SessaoPlenaria"("tenantId", "statusSessao");

-- AddForeignKey
ALTER TABLE "SessaoPlenaria" ADD CONSTRAINT "SessaoPlenaria_responsavelAberturaId_fkey" FOREIGN KEY ("responsavelAberturaId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
