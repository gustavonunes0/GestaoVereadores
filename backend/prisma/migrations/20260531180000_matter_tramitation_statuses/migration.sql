-- Task 21: status expandidos para tramitação básica de matéria
-- O default é aplicado em migração separada: novos valores de enum só podem ser
-- usados após commit da transação que os criou (PostgreSQL E55P04).

ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'PROTOCOLADA';
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'EM_PAUTA';
ALTER TYPE "StatusMateria" ADD VALUE IF NOT EXISTS 'TRANSFORMADA_EM_NORMA';
