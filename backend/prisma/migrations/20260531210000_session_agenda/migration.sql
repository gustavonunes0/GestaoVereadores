-- Fase PEQUENO_EXPEDIENTE
ALTER TYPE "FasePauta" ADD VALUE IF NOT EXISTS 'PEQUENO_EXPEDIENTE';

-- Unicidade apenas entre itens ativos (permite reentrada após soft delete)
DROP INDEX IF EXISTS "PautaItem_sessaoId_materiaId_key";
DROP INDEX IF EXISTS "PautaItem_sessaoId_ordem_key";

CREATE UNIQUE INDEX "PautaItem_sessaoId_materiaId_active_key"
    ON "PautaItem"("sessaoId", "materiaId")
    WHERE "isRemoved" = false;

CREATE UNIQUE INDEX "PautaItem_sessaoId_ordem_active_key"
    ON "PautaItem"("sessaoId", "ordem")
    WHERE "isRemoved" = false;

CREATE INDEX "PautaItem_sessaoId_idx" ON "PautaItem"("sessaoId");
