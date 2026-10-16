-- Spec 017: etapa Chamada antes da abertura
ALTER TYPE "StatusSessao" ADD VALUE IF NOT EXISTS 'CHAMADA';

ALTER TYPE "TipoEventoSessaoHistorico" ADD VALUE IF NOT EXISTS 'CHAMADA_INICIADA';

ALTER TABLE "SessaoPlenaria" ADD COLUMN IF NOT EXISTS "dataInicioChamada" TIMESTAMP(3);
