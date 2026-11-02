import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { PautaItemDetalhe } from '../../../../types/sessoes';
import { FecharVotacaoDialog } from '../FecharVotacaoDialog';

vi.mock('../../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showSuccess: vi.fn(),
        showApiError: vi.fn(),
        showToast: vi.fn(),
    }),
}));

vi.mock('../../../../api/legislative/sessoes.api', () => ({
    sessoesApi: {
        getPautaItem: vi.fn(),
        finalizarVotacao: vi.fn(),
        encerrarVotacao: vi.fn(),
    },
}));

function itemNominal(votos = { sim: 0, nao: 0, abs: 0 }): PautaItemDetalhe {
    return {
        id: 'item-1',
        sessaoId: 'sessao-1',
        ordem: 1,
        fase: 'ORDEM_DO_DIA',
        tipoPautaItem: 'DELIBERATIVA',
        status: 'PUBLICADA',
        categoria: 'MATERIA',
        materia: {
            id: 'mat-1',
            numero: '101',
            ano: 2026,
            ementa: 'Ementa teste',
            status: 'EM_VOTACAO',
            tipo: { id: 't1', nome: 'Emenda à Lei Orgânica', sigla: 'ELOM' },
        },
        votacao: {
            id: 'vot-1',
            tipoVotacao: 'NOMINAL',
            votosSim: votos.sim,
            votosNao: votos.nao,
            abstencoes: votos.abs,
            finalizada: false,
        },
    } as PautaItemDetalhe;
}

describe('FecharVotacaoDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('empilha conteúdo em coluna com classes do layout corrigido', () => {
        render(
            <FecharVotacaoDialog
                sessaoId="sessao-1"
                item={itemNominal()}
                titulo="ELOM nº 101/2026"
                onClose={vi.fn()}
                onFechada={vi.fn()}
            />,
        );

        // Dialog do PrimeReact faz portal no document.body
        expect(document.querySelector('.fechar-votacao-dialog__body')).toBeTruthy();
        expect(
            screen.getByText(/Encerrar votação de/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/ELOM nº 101\/2026/)).toBeInTheDocument();
    });

    it('mostra placar atual e alerta quando placar está zerado', () => {
        render(
            <FecharVotacaoDialog
                sessaoId="sessao-1"
                item={itemNominal({ sim: 0, nao: 0, abs: 0 })}
                titulo="ELOM nº 101/2026"
                onClose={vi.fn()}
                onFechada={vi.fn()}
            />,
        );

        expect(
            screen.getByText(/Placar atual — Sim: 0 · Não: 0 · Abstenções: 0/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Nenhum voto individual registrado/),
        ).toBeInTheDocument();
        expect(
            document.querySelector('.fechar-votacao-dialog__alert--info'),
        ).toBeTruthy();
        expect(
            document.querySelector('.fechar-votacao-dialog__alert--warn'),
        ).toBeTruthy();
    });

    it('renderiza botão Fechar votação com estilo de botão sólido', () => {
        render(
            <FecharVotacaoDialog
                sessaoId="sessao-1"
                item={itemNominal({ sim: 2, nao: 1, abs: 0 })}
                onClose={vi.fn()}
                onFechada={vi.fn()}
            />,
        );

        const btn = screen.getByRole('button', { name: /Fechar votação/i });
        expect(btn.className).toContain('pauta-fechar-votacao-btn');
    });
});
