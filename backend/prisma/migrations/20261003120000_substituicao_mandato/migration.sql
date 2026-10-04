-- CreateEnum
CREATE TYPE "MotivoSubstituicao" AS ENUM ('LICENCA', 'AFASTAMENTO', 'CARGO_EXECUTIVO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusSubstituicao" AS ENUM ('ATIVA', 'ENCERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "AcaoSubstituicaoHistorico" AS ENUM ('CRIADA', 'DATAS_ALTERADAS', 'ENCERRADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "substituicoes_mandato" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legislatureId" TEXT NOT NULL,
    "titularId" TEXT NOT NULL,
    "suplenteId" TEXT NOT NULL,
    "motivo" "MotivoSubstituicao" NOT NULL,
    "dataInicio" DATE NOT NULL,
    "dataFim" DATE,
    "observacao" TEXT,
    "status" "StatusSubstituicao" NOT NULL DEFAULT 'ATIVA',
    "criadoPorId" TEXT,
    "encerradoPorId" TEXT,
    "encerradaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "substituicoes_mandato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substituicao_historico" (
    "id" TEXT NOT NULL,
    "substituicaoId" TEXT NOT NULL,
    "acao" "AcaoSubstituicaoHistorico" NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" TEXT,
    "alteracoesJson" JSONB,

    CONSTRAINT "substituicao_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessao_elenco_exercicio" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "titularId" TEXT NOT NULL,
    "emExercicioId" TEXT NOT NULL,
    "substituicaoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessao_elenco_exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "substituicoes_mandato_tenantId_titularId_idx" ON "substituicoes_mandato"("tenantId", "titularId");

-- CreateIndex
CREATE INDEX "substituicoes_mandato_tenantId_suplenteId_idx" ON "substituicoes_mandato"("tenantId", "suplenteId");

-- CreateIndex
CREATE INDEX "substituicoes_mandato_tenantId_legislatureId_status_idx" ON "substituicoes_mandato"("tenantId", "legislatureId", "status");

-- CreateIndex
CREATE INDEX "substituicao_historico_substituicaoId_dataHora_idx" ON "substituicao_historico"("substituicaoId", "dataHora");

-- CreateIndex
CREATE INDEX "sessao_elenco_exercicio_sessaoId_idx" ON "sessao_elenco_exercicio"("sessaoId");

-- CreateIndex
CREATE UNIQUE INDEX "sessao_elenco_exercicio_sessaoId_titularId_key" ON "sessao_elenco_exercicio"("sessaoId", "titularId");

-- AddForeignKey
ALTER TABLE "substituicoes_mandato" ADD CONSTRAINT "substituicoes_mandato_legislatureId_fkey" FOREIGN KEY ("legislatureId") REFERENCES "legislatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicoes_mandato" ADD CONSTRAINT "substituicoes_mandato_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicoes_mandato" ADD CONSTRAINT "substituicoes_mandato_suplenteId_fkey" FOREIGN KEY ("suplenteId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicoes_mandato" ADD CONSTRAINT "substituicoes_mandato_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicoes_mandato" ADD CONSTRAINT "substituicoes_mandato_encerradoPorId_fkey" FOREIGN KEY ("encerradoPorId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicao_historico" ADD CONSTRAINT "substituicao_historico_substituicaoId_fkey" FOREIGN KEY ("substituicaoId") REFERENCES "substituicoes_mandato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substituicao_historico" ADD CONSTRAINT "substituicao_historico_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessao_elenco_exercicio" ADD CONSTRAINT "sessao_elenco_exercicio_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
