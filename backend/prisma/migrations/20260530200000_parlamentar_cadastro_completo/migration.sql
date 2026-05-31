-- AlterTable
ALTER TABLE "Pessoa" ADD COLUMN "nomeParlamentar" TEXT,
ADD COLUMN "rg" TEXT,
ADD COLUMN "tituloEleitor" TEXT,
ADD COLUMN "dataNascimento" TIMESTAMP(3),
ADD COLUMN "sexo" TEXT,
ADD COLUMN "telefone" TEXT,
ADD COLUMN "celular" TEXT,
ADD COLUMN "cep" TEXT,
ADD COLUMN "logradouro" TEXT,
ADD COLUMN "numeroEndereco" TEXT,
ADD COLUMN "complemento" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "cidade" TEXT,
ADD COLUMN "uf" TEXT,
ADD COLUMN "site" TEXT;

-- AlterTable
ALTER TABLE "Parlamentar" ADD COLUMN "partido" TEXT,
ADD COLUMN "profissao" TEXT,
ADD COLUMN "gabinete" TEXT,
ADD COLUMN "situacaoMilitar" TEXT,
ADD COLUMN "nivelInstrucao" TEXT,
ADD COLUMN "fotoUrl" TEXT,
ADD COLUMN "biografia" TEXT;

-- CreateTable
CREATE TABLE "ParlamentarMandato" (
    "id" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "legislaturaId" TEXT NOT NULL,
    "titular" BOOLEAN NOT NULL DEFAULT true,
    "dataPosse" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "dataExpedicaoDiploma" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ParlamentarMandato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParlamentarMandato_legislaturaId_idx" ON "ParlamentarMandato"("legislaturaId");
CREATE UNIQUE INDEX "ParlamentarMandato_parlamentarId_legislaturaId_key" ON "ParlamentarMandato"("parlamentarId", "legislaturaId");

-- AddForeignKey
ALTER TABLE "ParlamentarMandato" ADD CONSTRAINT "ParlamentarMandato_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ParlamentarMandato" ADD CONSTRAINT "ParlamentarMandato_legislaturaId_fkey" FOREIGN KEY ("legislaturaId") REFERENCES "Legislatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;
