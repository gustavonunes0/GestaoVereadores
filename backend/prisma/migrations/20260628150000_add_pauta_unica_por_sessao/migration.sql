-- Uma pauta ativa por sessão (RN-SPL-PAUTA-01)
CREATE TABLE "pautas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "status" "StatusPautaItem" NOT NULL DEFAULT 'RASCUNHO',
    "publicadaEm" TIMESTAMP(3),
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pautas_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pautas_tenantId_idx" ON "pautas"("tenantId");
CREATE INDEX "pautas_sessaoId_idx" ON "pautas"("sessaoId");
CREATE INDEX "pautas_tenantId_status_idx" ON "pautas"("tenantId", "status");

-- Apenas uma pauta ativa (não removida) por sessão
CREATE UNIQUE INDEX "pautas_sessaoId_active_key"
    ON "pautas"("sessaoId")
    WHERE "isRemoved" = false;

ALTER TABLE "pautas"
    ADD CONSTRAINT "pautas_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "pautas"
    ADD CONSTRAINT "pautas_sessaoId_fkey"
    FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: uma pauta por sessão que já possui itens ativos
INSERT INTO "pautas" ("id", "tenantId", "sessaoId", "status", "publicadaEm", "isRemoved", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    s."tenantId",
    s."id",
    CASE
        WHEN EXISTS (
            SELECT 1 FROM "PautaItem" pi
            WHERE pi."sessaoId" = s."id" AND pi."isRemoved" = false AND pi."statusPauta" = 'ENCERRADA'
        ) THEN 'ENCERRADA'::"StatusPautaItem"
        WHEN EXISTS (
            SELECT 1 FROM "PautaItem" pi
            WHERE pi."sessaoId" = s."id" AND pi."isRemoved" = false AND pi."statusPauta" = 'PUBLICADA'
        ) THEN 'PUBLICADA'::"StatusPautaItem"
        ELSE 'RASCUNHO'::"StatusPautaItem"
    END,
    (
        SELECT MAX(pi."publicadaEm")
        FROM "PautaItem" pi
        WHERE pi."sessaoId" = s."id" AND pi."isRemoved" = false
    ),
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "SessaoPlenaria" s
WHERE EXISTS (
    SELECT 1 FROM "PautaItem" pi
    WHERE pi."sessaoId" = s."id" AND pi."isRemoved" = false
);

ALTER TABLE "PautaItem" ADD COLUMN "pautaId" TEXT;

UPDATE "PautaItem" pi
SET "pautaId" = p."id"
FROM "pautas" p
WHERE p."sessaoId" = pi."sessaoId" AND pi."isRemoved" = false;

ALTER TABLE "PautaItem" ALTER COLUMN "pautaId" SET NOT NULL;

ALTER TABLE "PautaItem"
    ADD CONSTRAINT "PautaItem_pautaId_fkey"
    FOREIGN KEY ("pautaId") REFERENCES "pautas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "PautaItem_pautaId_idx" ON "PautaItem"("pautaId");
