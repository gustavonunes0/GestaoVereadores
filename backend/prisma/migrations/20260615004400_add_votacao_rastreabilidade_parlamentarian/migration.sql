-- DropForeignKey
ALTER TABLE "VotoParlamentar" DROP CONSTRAINT "VotoParlamentar_parlamentarId_fkey";

-- AlterTable
ALTER TABLE "Votacao" ADD COLUMN     "encerradaAt" TIMESTAMP(3),
ADD COLUMN     "motivoEmpate" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "quorumVotacao" INTEGER,
ADD COLUMN     "responsavelId" TEXT;

-- AlterTable
ALTER TABLE "VotoParlamentar" ADD COLUMN     "parliamentarianId" TEXT,
ALTER COLUMN "parlamentarId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VotoParlamentar_votacaoId_parliamentarianId_key" ON "VotoParlamentar"("votacaoId", "parliamentarianId");

-- AddForeignKey
ALTER TABLE "Votacao" ADD CONSTRAINT "Votacao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoParlamentar" ADD CONSTRAINT "VotoParlamentar_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VotoParlamentar" ADD CONSTRAINT "VotoParlamentar_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
