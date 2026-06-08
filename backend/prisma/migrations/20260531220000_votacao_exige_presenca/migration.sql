-- Task 26: configuração de exigência de presença para voto individual
ALTER TABLE "Votacao" ADD COLUMN "exigePresenca" BOOLEAN NOT NULL DEFAULT true;
