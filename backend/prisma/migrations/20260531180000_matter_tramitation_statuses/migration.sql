-- Task 21: novos valores do enum (transação separada do uso do valor — exigência PostgreSQL)
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'PROTOCOLADA';
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'EM_PAUTA';
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'TRANSFORMADA_EM_NORMA';
