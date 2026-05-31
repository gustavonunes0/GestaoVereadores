-- CreateEnum
CREATE TYPE "StatusMateria" AS ENUM ('EM_TRAMITACAO', 'APROVADA', 'REJEITADA', 'ARQUIVADA', 'RETIRADA');

CREATE TYPE "CodigoSituacaoSessao" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'ENCERRADA', 'CANCELADA');

CREATE TYPE "FasePauta" AS ENUM ('GRANDE_EXPEDIENTE', 'ORDEM_DO_DIA', 'EXPLICACOES_PESSOAIS');

CREATE TYPE "ResultadoPauta" AS ENUM ('APROVADO', 'REJEITADO', 'RETIRADO', 'ADIADO');

-- Materia: status legislativo
ALTER TABLE "Materia" ADD COLUMN "status" "StatusMateria";
ALTER TABLE "Materia" ADD COLUMN "tramitacaoJson" JSONB NOT NULL DEFAULT '[]';

UPDATE "Materia" SET "status" = 'EM_TRAMITACAO' WHERE "emTramitacao" = true;
UPDATE "Materia" SET "status" = 'ARQUIVADA' WHERE "emTramitacao" = false OR "status" IS NULL;

ALTER TABLE "Materia" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Materia" ALTER COLUMN "status" SET DEFAULT 'EM_TRAMITACAO';

CREATE INDEX "Materia_tenantId_status_idx" ON "Materia"("tenantId", "status");

-- Unicidade proposição (tipo + número + ano da câmara)
CREATE UNIQUE INDEX "Materia_tenantId_tipoId_numero_anoId_key"
  ON "Materia"("tenantId", "tipoId", "numero", "anoId");

-- TipoSessao: quorum
ALTER TABLE "TipoSessao" ADD COLUMN "requerQuorum" BOOLEAN NOT NULL DEFAULT true;

-- SituacaoSessao: código para regras de pauta
ALTER TABLE "SituacaoSessao" ADD COLUMN "codigo" "CodigoSituacaoSessao";

UPDATE "SituacaoSessao" SET "codigo" = 'AGENDADA' WHERE LOWER("nome") LIKE '%agendad%';
UPDATE "SituacaoSessao" SET "codigo" = 'EM_ANDAMENTO' WHERE LOWER("nome") LIKE '%andamento%';
UPDATE "SituacaoSessao" SET "codigo" = 'ENCERRADA' WHERE LOWER("nome") LIKE '%encerrad%';
UPDATE "SituacaoSessao" SET "codigo" = 'CANCELADA' WHERE LOWER("nome") LIKE '%cancelad%';

CREATE UNIQUE INDEX "SituacaoSessao_codigo_key" ON "SituacaoSessao"("codigo");

-- PautaItem: fase, resultado, soft delete, auditoria
ALTER TABLE "PautaItem" ADD COLUMN "fase" "FasePauta" NOT NULL DEFAULT 'ORDEM_DO_DIA';
ALTER TABLE "PautaItem" ADD COLUMN "resultado" "ResultadoPauta";
ALTER TABLE "PautaItem" ADD COLUMN "isRemoved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PautaItem" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "PautaItem" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
