-- Item de pauta polimórfico (matéria, ato, norma, aviso, parecer de comissão)

-- CreateEnum
CREATE TYPE "CategoriaPautaItem" AS ENUM ('MATERIA', 'ATO', 'NORMA', 'AVISO', 'COMISSAO');

-- AlterTable: nova categoria + referências opcionais
ALTER TABLE "PautaItem"
    ADD COLUMN "categoria" "CategoriaPautaItem" NOT NULL DEFAULT 'MATERIA',
    ADD COLUMN "atoId" TEXT,
    ADD COLUMN "normaId" TEXT,
    ADD COLUMN "comissaoId" TEXT,
    ADD COLUMN "avisoTitulo" TEXT,
    ADD COLUMN "avisoTexto" TEXT;

-- materiaId passa a ser opcional (itens de ato/norma/aviso não têm matéria)
ALTER TABLE "PautaItem" ALTER COLUMN "materiaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PautaItem"
    ADD CONSTRAINT "PautaItem_atoId_fkey"
    FOREIGN KEY ("atoId") REFERENCES "Ato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PautaItem"
    ADD CONSTRAINT "PautaItem_normaId_fkey"
    FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PautaItem"
    ADD CONSTRAINT "PautaItem_comissaoId_fkey"
    FOREIGN KEY ("comissaoId") REFERENCES "Comissao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PautaItem_atoId_idx" ON "PautaItem"("atoId");
CREATE INDEX "PautaItem_normaId_idx" ON "PautaItem"("normaId");
CREATE INDEX "PautaItem_comissaoId_idx" ON "PautaItem"("comissaoId");
