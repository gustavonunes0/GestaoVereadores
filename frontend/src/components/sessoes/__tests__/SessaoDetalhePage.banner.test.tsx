import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regressão: banner "Votação em andamento" foi removido da tela de detalhe.
 * Mantém o fechamento de votação na pauta (PautaDetalhePanel / FecharVotacaoDialog).
 */
describe('SessaoDetalhePage — remoção do banner de votação', () => {
    const source = readFileSync(
        path.resolve(__dirname, '../SessaoDetalhePage.tsx'),
        'utf-8',
    );

    it('não renderiza o banner sessao-votacao-banner', () => {
        expect(source).not.toContain('sessao-votacao-banner');
        expect(source).not.toContain('Votação em andamento');
    });

    it('não importa mais FecharVotacaoDialog no detalhe (fica na pauta)', () => {
        expect(source).not.toContain("from './pauta/FecharVotacaoDialog'");
    });
});
