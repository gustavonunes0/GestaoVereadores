-- DropForeignKey
ALTER TABLE "TipoAutor" DROP CONSTRAINT "TipoAutor_tenantId_fkey";

-- AlterTable
ALTER TABLE "Autor" ADD COLUMN     "autorExternoId" TEXT,
ALTER COLUMN "nome" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TipoAutor" ADD COLUMN     "idNegocio" INTEGER,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "autores_externos" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tipoAutorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "instituicao" TEXT,
    "cpf" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "registro" TEXT,
    "partido" TEXT,
    "uf" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autores_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramitacao_historico" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusAnterior" "StatusMateria",
    "statusNovo" "StatusMateria" NOT NULL,
    "unidadeOrigemId" TEXT,
    "unidadeDestinoId" TEXT,
    "responsavelId" TEXT,
    "despacho" TEXT,
    "observacao" TEXT,

    CONSTRAINT "tramitacao_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicacoes_oficiais" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "materiaId" TEXT,
    "normaId" TEXT,
    "dataPublicacao" TIMESTAMP(3) NOT NULL,
    "veiculo" TEXT NOT NULL,
    "paginaInicio" INTEGER,
    "paginaFim" INTEGER,
    "identificador" TEXT,
    "urlExterna" TEXT,
    "textoIntegral" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publicacoes_oficiais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "autores_externos_tenantId_idx" ON "autores_externos"("tenantId");

-- CreateIndex
CREATE INDEX "autores_externos_tenantId_isRemoved_idx" ON "autores_externos"("tenantId", "isRemoved");

-- CreateIndex
CREATE INDEX "tramitacao_historico_materiaId_idx" ON "tramitacao_historico"("materiaId");

-- CreateIndex
CREATE INDEX "tramitacao_historico_materiaId_dataHora_idx" ON "tramitacao_historico"("materiaId", "dataHora");

-- CreateIndex
CREATE INDEX "publicacoes_oficiais_tenantId_idx" ON "publicacoes_oficiais"("tenantId");

-- CreateIndex
CREATE INDEX "publicacoes_oficiais_materiaId_idx" ON "publicacoes_oficiais"("materiaId");

-- CreateIndex
CREATE INDEX "publicacoes_oficiais_normaId_idx" ON "publicacoes_oficiais"("normaId");

-- CreateIndex
CREATE INDEX "Autor_tenantId_autorExternoId_idx" ON "Autor"("tenantId", "autorExternoId");

-- AddForeignKey
ALTER TABLE "TipoAutor" ADD CONSTRAINT "TipoAutor_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_autorExternoId_fkey" FOREIGN KEY ("autorExternoId") REFERENCES "autores_externos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autores_externos" ADD CONSTRAINT "autores_externos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autores_externos" ADD CONSTRAINT "autores_externos_tipoAutorId_fkey" FOREIGN KEY ("tipoAutorId") REFERENCES "TipoAutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramitacao_historico" ADD CONSTRAINT "tramitacao_historico_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramitacao_historico" ADD CONSTRAINT "tramitacao_historico_unidadeOrigemId_fkey" FOREIGN KEY ("unidadeOrigemId") REFERENCES "UnidadeTramitacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramitacao_historico" ADD CONSTRAINT "tramitacao_historico_unidadeDestinoId_fkey" FOREIGN KEY ("unidadeDestinoId") REFERENCES "UnidadeTramitacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramitacao_historico" ADD CONSTRAINT "tramitacao_historico_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacoes_oficiais" ADD CONSTRAINT "publicacoes_oficiais_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacoes_oficiais" ADD CONSTRAINT "publicacoes_oficiais_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicacoes_oficiais" ADD CONSTRAINT "publicacoes_oficiais_normaId_fkey" FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE SET NULL ON UPDATE CASCADE;
