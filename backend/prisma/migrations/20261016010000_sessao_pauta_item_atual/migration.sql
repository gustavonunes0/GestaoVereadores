-- Spec 018: item atual da pauta exibido no painel público
ALTER TABLE "SessaoPlenaria" ADD COLUMN IF NOT EXISTS "pautaItemAtualId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "SessaoPlenaria_pautaItemAtualId_key" ON "SessaoPlenaria"("pautaItemAtualId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'SessaoPlenaria_pautaItemAtualId_fkey'
    ) THEN
        ALTER TABLE "SessaoPlenaria"
            ADD CONSTRAINT "SessaoPlenaria_pautaItemAtualId_fkey"
            FOREIGN KEY ("pautaItemAtualId") REFERENCES "PautaItem"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
