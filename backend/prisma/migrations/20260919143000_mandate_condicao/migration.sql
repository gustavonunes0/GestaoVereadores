-- AlterEnum
CREATE TYPE "CondicaoMandato" AS ENUM ('TITULAR', 'SUPLENTE');

-- AlterTable
ALTER TABLE "parliamentarian_mandates"
ADD COLUMN "condicao" "CondicaoMandato" NOT NULL DEFAULT 'TITULAR',
ADD COLUMN "titularAfastadoId" TEXT;

-- CreateIndex
CREATE INDEX "parliamentarian_mandates_titularAfastadoId_idx" ON "parliamentarian_mandates"("titularAfastadoId");

-- AddForeignKey
ALTER TABLE "parliamentarian_mandates"
ADD CONSTRAINT "parliamentarian_mandates_titularAfastadoId_fkey"
FOREIGN KEY ("titularAfastadoId") REFERENCES "parliamentarians"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
