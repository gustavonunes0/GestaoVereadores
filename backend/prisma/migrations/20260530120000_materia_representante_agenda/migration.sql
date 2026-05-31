-- CreateTable
CREATE TABLE "MateriaRepresentante" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "MateriaRepresentante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaLegislativa" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "numero" TEXT,
    "titulo" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "mensagem" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaLegislativa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MateriaRepresentante_materiaId_parlamentarId_key" ON "MateriaRepresentante"("materiaId", "parlamentarId");
CREATE UNIQUE INDEX "MateriaRepresentante_materiaId_ordem_key" ON "MateriaRepresentante"("materiaId", "ordem");
CREATE INDEX "AgendaLegislativa_tenantId_idx" ON "AgendaLegislativa"("tenantId");

-- AddForeignKey
ALTER TABLE "MateriaRepresentante" ADD CONSTRAINT "MateriaRepresentante_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MateriaRepresentante" ADD CONSTRAINT "MateriaRepresentante_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgendaLegislativa" ADD CONSTRAINT "AgendaLegislativa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
