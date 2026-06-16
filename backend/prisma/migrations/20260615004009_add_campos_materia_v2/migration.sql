-- AlterTable
ALTER TABLE "Materia" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "dataProtocolo" TIMESTAMP(3),
ADD COLUMN     "dataPublicacao" TIMESTAMP(3),
ADD COLUMN     "identificadorPublicacao" TEXT,
ADD COLUMN     "justificativa" TEXT,
ADD COLUMN     "paginaFim" INTEGER,
ADD COLUMN     "paginaInicio" INTEGER,
ADD COLUMN     "removedAt" TIMESTAMP(3),
ADD COLUMN     "sigla" TEXT,
ADD COLUMN     "textoIntegralUrl" TEXT,
ADD COLUMN     "textoOriginalUrl" TEXT,
ADD COLUMN     "urlExternaPublicacao" TEXT,
ADD COLUMN     "veiculoPublicacao" TEXT;

-- CreateIndex
CREATE INDEX "Materia_tenantId_isRemoved_idx" ON "Materia"("tenantId", "isRemoved");
