-- DropForeignKey
ALTER TABLE "PresencaSessao" DROP CONSTRAINT "PresencaSessao_parlamentarId_fkey";

-- AlterTable
ALTER TABLE "PresencaSessao" ADD COLUMN     "parliamentarianId" TEXT,
ALTER COLUMN "parlamentarId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PresencaSessao_sessaoId_parliamentarianId_key" ON "PresencaSessao"("sessaoId", "parliamentarianId");

-- AddForeignKey
ALTER TABLE "PresencaSessao" ADD CONSTRAINT "PresencaSessao_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaSessao" ADD CONSTRAINT "PresencaSessao_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
