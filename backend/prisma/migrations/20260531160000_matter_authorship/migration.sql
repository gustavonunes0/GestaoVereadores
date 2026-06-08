-- Task 20: autoria de matérias (parlamentar, externo/GuestUser, coautores, relator)

ALTER TABLE "Autor" ADD COLUMN "parliamentarianId" TEXT;
ALTER TABLE "Autor" ADD COLUMN "guestUserId" TEXT;

ALTER TABLE "Materia" ADD COLUMN "authorParliamentarianId" TEXT;
ALTER TABLE "Materia" ADD COLUMN "rapporteurParliamentarianId" TEXT;

CREATE TABLE "matter_coauthors" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matter_coauthors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "matter_coauthors_matterId_parliamentarianId_key" ON "matter_coauthors"("matterId", "parliamentarianId");
CREATE UNIQUE INDEX "matter_coauthors_matterId_ordem_key" ON "matter_coauthors"("matterId", "ordem");
CREATE INDEX "matter_coauthors_tenantId_matterId_idx" ON "matter_coauthors"("tenantId", "matterId");
CREATE INDEX "Autor_tenantId_guestUserId_idx" ON "Autor"("tenantId", "guestUserId");
CREATE INDEX "Autor_tenantId_parliamentarianId_idx" ON "Autor"("tenantId", "parliamentarianId");

ALTER TABLE "Autor" ADD CONSTRAINT "Autor_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_guestUserId_fkey" FOREIGN KEY ("guestUserId") REFERENCES "guest_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Materia" ADD CONSTRAINT "Materia_authorParliamentarianId_fkey" FOREIGN KEY ("authorParliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_rapporteurParliamentarianId_fkey" FOREIGN KEY ("rapporteurParliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "matter_coauthors" ADD CONSTRAINT "matter_coauthors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "matter_coauthors" ADD CONSTRAINT "matter_coauthors_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "matter_coauthors" ADD CONSTRAINT "matter_coauthors_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
