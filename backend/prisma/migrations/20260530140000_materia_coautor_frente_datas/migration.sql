-- AlterTable
ALTER TABLE "FrenteParlamentar" ADD COLUMN "dataEntrada" TIMESTAMP(3),
ADD COLUMN "dataSaida" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MateriaCoautor" (
    "id" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "MateriaCoautor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MateriaCoautor_materiaId_parlamentarId_key" ON "MateriaCoautor"("materiaId", "parlamentarId");
CREATE UNIQUE INDEX "MateriaCoautor_materiaId_ordem_key" ON "MateriaCoautor"("materiaId", "ordem");

-- AddForeignKey
ALTER TABLE "MateriaCoautor" ADD CONSTRAINT "MateriaCoautor_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MateriaCoautor" ADD CONSTRAINT "MateriaCoautor_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
