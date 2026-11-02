import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('CSS do painel — regressões de UI', () => {
    const votingCss = readFileSync(
        path.resolve(__dirname, '../voting-panel.css'),
        'utf-8',
    );
    const patternsCss = readFileSync(
        path.resolve(__dirname, '../sigl-ui-patterns.css'),
        'utf-8',
    );
    const sessaoCss = readFileSync(
        path.resolve(__dirname, '../lex-sessao.css'),
        'utf-8',
    );

    it('card do parlamentar reserva rodapé (grid) para não cortar o partido', () => {
        expect(votingCss).toMatch(
            /\.vp-row--card\s*\{[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto/s,
        );
    });

    it('rótulo do placar usa tipografia ampliada', () => {
        expect(votingCss).toMatch(/\.vp-counter__label\s*\{[^}]*clamp\(/s);
    });

    it('totais de presença ficam centralizados e maiores', () => {
        expect(patternsCss).toMatch(
            /\.sessao-painel-presenca__totais\s*\{[^}]*justify-content:\s*center/s,
        );
        expect(patternsCss).toMatch(
            /\.sessao-painel-presenca__total\s*\{[^}]*font-size:\s*0\.9rem/s,
        );
    });

    it('cabeçalho do telão segue padrão de card (borda + radius + sombra)', () => {
        expect(patternsCss).toMatch(
            /\.sessao-painel-header\s*\{[^}]*border-radius:\s*1rem/s,
        );
        expect(patternsCss).toMatch(
            /\.sessao-painel-header\s*\{[^}]*box-shadow:/s,
        );
    });

    it('botão Fechar votação tem estilo sólido dedicado', () => {
        expect(sessaoCss).toContain('.pauta-fechar-votacao-btn');
        expect(sessaoCss).toContain('.fechar-votacao-dialog__body');
    });
});
