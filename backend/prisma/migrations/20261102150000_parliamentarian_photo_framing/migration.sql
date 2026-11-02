-- Enquadramento obrigatório de foto (ponto focal + zoom + confirmação)
ALTER TABLE "parliamentarians"
  ADD COLUMN "photoPosX" DECIMAL(5,2) NOT NULL DEFAULT 50,
  ADD COLUMN "photoPosY" DECIMAL(5,2) NOT NULL DEFAULT 30,
  ADD COLUMN "photoZoom" DECIMAL(4,2) NOT NULL DEFAULT 1,
  ADD COLUMN "photoPositionConfirmed" BOOLEAN NOT NULL DEFAULT FALSE;
