-- CreateEnum
CREATE TYPE "StatusPedidoPalavra" AS ENUM ('AGUARDANDO', 'CONCEDIDO', 'NEGADO', 'ENCERRADO');

-- CreateTable
CREATE TABLE "pedidos_palavra" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "status" "StatusPedidoPalavra" NOT NULL DEFAULT 'AGUARDANDO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),
    "encerradoEm" TIMESTAMP(3),
    "duracaoSegundos" INTEGER,

    CONSTRAINT "pedidos_palavra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedidos_palavra_sessaoId_status_idx" ON "pedidos_palavra"("sessaoId", "status");

-- CreateIndex
CREATE INDEX "pedidos_palavra_sessaoId_parliamentarianId_idx" ON "pedidos_palavra"("sessaoId", "parliamentarianId");

-- AddForeignKey
ALTER TABLE "pedidos_palavra" ADD CONSTRAINT "pedidos_palavra_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_palavra" ADD CONSTRAINT "pedidos_palavra_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
