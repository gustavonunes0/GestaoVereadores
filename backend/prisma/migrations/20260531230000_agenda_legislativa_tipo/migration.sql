-- CreateEnum
CREATE TYPE "TipoEventoAgenda" AS ENUM ('SESSAO', 'REUNIAO', 'AUDIENCIA', 'EVENTO', 'COMPROMISSO');

-- AlterTable
ALTER TABLE "AgendaLegislativa" ADD COLUMN "tipo" "TipoEventoAgenda";

-- CreateIndex
CREATE INDEX "AgendaLegislativa_tenantId_dataInicio_idx" ON "AgendaLegislativa"("tenantId", "dataInicio");
