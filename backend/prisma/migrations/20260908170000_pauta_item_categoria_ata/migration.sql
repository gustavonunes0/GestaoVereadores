-- AlterEnum
-- Item de pauta do tipo ata (leitura/aprovação da ata da sessão anterior).
-- A coluna "ataReferenciadaId" e sua FK já vieram na migration
-- 20260729140606_add_sessao_historico_ata_orador_expandido; só faltava a categoria.
ALTER TYPE "CategoriaPautaItem" ADD VALUE 'ATA';
