-- CreateEnum
CREATE TYPE "TipoVotacao" AS ENUM ('NOMINAL', 'SIMBOLICA', 'SECRETA');
CREATE TYPE "ResultadoVotacao" AS ENUM ('APROVADO', 'REJEITADO', 'EMPATADO');
CREATE TYPE "Voto" AS ENUM ('SIM', 'NAO', 'ABSTENCAO', 'PRESENTE');
CREATE TYPE "SituacaoPresenca" AS ENUM ('PRESENTE', 'AUSENTE', 'JUSTIFICADO');

-- MateriaAutor
CREATE TABLE "MateriaAutor" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    CONSTRAINT "MateriaAutor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MateriaAutor_materiaId_autorId_key" ON "MateriaAutor"("materiaId", "autorId");
CREATE UNIQUE INDEX "MateriaAutor_materiaId_ordem_key" ON "MateriaAutor"("materiaId", "ordem");

ALTER TABLE "MateriaAutor" ADD CONSTRAINT "MateriaAutor_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MateriaAutor" ADD CONSTRAINT "MateriaAutor_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PresencaSessao extras
ALTER TABLE "PresencaSessao" ADD COLUMN "situacao" "SituacaoPresenca" NOT NULL DEFAULT 'PRESENTE';
ALTER TABLE "PresencaSessao" ADD COLUMN "justificativa" TEXT;
ALTER TABLE "PresencaSessao" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "PresencaSessao" SET "situacao" = 'AUSENTE' WHERE "presente" = false;

-- Votacao
CREATE TABLE "Votacao" (
    "id" TEXT NOT NULL,
    "pautaItemId" TEXT NOT NULL,
    "tipoVotacao" "TipoVotacao" NOT NULL,
    "votosSim" INTEGER NOT NULL DEFAULT 0,
    "votosNao" INTEGER NOT NULL DEFAULT 0,
    "abstencoes" INTEGER NOT NULL DEFAULT 0,
    "resultado" "ResultadoVotacao",
    "realizadaAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Votacao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Votacao_pautaItemId_key" ON "Votacao"("pautaItemId");

ALTER TABLE "Votacao" ADD CONSTRAINT "Votacao_pautaItemId_fkey" FOREIGN KEY ("pautaItemId") REFERENCES "PautaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VotoParlamentar
CREATE TABLE "VotoParlamentar" (
    "id" TEXT NOT NULL,
    "votacaoId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "voto" "Voto" NOT NULL,
    CONSTRAINT "VotoParlamentar_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VotoParlamentar_votacaoId_parlamentarId_key" ON "VotoParlamentar"("votacaoId", "parlamentarId");

ALTER TABLE "VotoParlamentar" ADD CONSTRAINT "VotoParlamentar_votacaoId_fkey" FOREIGN KEY ("votacaoId") REFERENCES "Votacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VotoParlamentar" ADD CONSTRAINT "VotoParlamentar_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
