-- CreateEnum
CREATE TYPE "FaseSessao" AS ENUM ('NAO_INICIADA', 'EXPEDIENTE', 'ORDEM_DO_DIA', 'EXPLICACOES_PESSOAIS', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "TipoPautaItem" AS ENUM ('LEITURA', 'DELIBERACAO', 'COMUNICACAO');

-- CreateEnum
CREATE TYPE "TipoQuorum" AS ENUM ('MAIORIA_SIMPLES', 'MAIORIA_ABSOLUTA', 'QUALIFICADO_DOIS_TERCOS', 'QUALIFICADO_TRES_QUINTOS');

-- CreateEnum
CREATE TYPE "ModalidadePresenca" AS ENUM ('PRESENCIAL', 'REMOTO');

-- AlterTable
ALTER TABLE "PautaItem" ADD COLUMN     "tipoPautaItem" "TipoPautaItem" NOT NULL DEFAULT 'DELIBERACAO';

-- AlterTable
ALTER TABLE "PresencaSessao" ADD COLUMN     "autoRegistrado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modalidade" "ModalidadePresenca" NOT NULL DEFAULT 'PRESENCIAL',
ADD COLUMN     "registradoEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SessaoPlenaria" ADD COLUMN     "faseAtual" "FaseSessao" NOT NULL DEFAULT 'NAO_INICIADA',
ADD COLUMN     "linkJitsi" TEXT,
ADD COLUMN     "linkYoutube" TEXT;

-- AlterTable
ALTER TABLE "TipoMateria" ADD COLUMN     "tipoQuorum" "TipoQuorum" NOT NULL DEFAULT 'MAIORIA_SIMPLES';

-- AlterTable
ALTER TABLE "Votacao" ADD COLUMN     "presidenteId" TEXT,
ADD COLUMN     "tipoQuorum" "TipoQuorum",
ADD COLUMN     "totalMembros" INTEGER,
ADD COLUMN     "votoQualidade" BOOLEAN NOT NULL DEFAULT false;
