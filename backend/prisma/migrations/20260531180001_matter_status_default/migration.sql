-- Default de status após os novos valores do enum estarem commitados.

ALTER TABLE "Materia" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
