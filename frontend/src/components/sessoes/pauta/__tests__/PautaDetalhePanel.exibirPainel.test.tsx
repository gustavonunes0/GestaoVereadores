import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PautaItemDetalhe } from '../../../../types/sessoes';
import { PautaDetalhePanel } from '../PautaDetalhePanel';

vi.mock('../../../../hooks/useAppToast', () => ({
    useAppToast: () => ({
        showSuccess: vi.fn(),
        showApiError: vi.fn(),
        showToast: vi.fn(),
    }),
}));

vi.mock('../usePautaItemConteudo', () => ({
    usePautaItemConteudo: () => ({
        detalhe: null,
        loading: false,
        autorPrincipal: null,
        statusMateria: null,
        comissaoNome: null,
        votacaoPlacar: null,
    }),
}));

vi.mock('../PautaItemLeitura', () => ({
    PautaItemLeitura: () => <div data-testid="leitura" />,
}));

vi.mock('../PautaVotacaoMiniDashboard', () => ({
    PautaVotacaoMiniDashboard: () => <div data-testid="mini-placar" />,
    resolvePautaVotacaoPlacar: () => ({
        status: 'em_andamento',
        statusLabel: 'Em andamento',
        votosSim: 0,
        votosNao: 0,
        abstencoes: 0,
    }),
}));

vi.mock('../../materias/MateriaAutorAvatar', () => ({
    MateriaAutorAvatar: () => null,
}));

function itemPublicado(): PautaItemDetalhe {
    return {
        id: 'item-1',
        sessaoId: 's1',
        ordem: 1,
        fase: 'ORDEM_DO_DIA',
        tipoPautaItem: 'DELIBERATIVA',
        status: 'PUBLICADA',
        categoria: 'MATERIA',
        materia: {
            id: 'm1',
            numero: '101',
            ano: 2026,
            ementa: 'Teste',
            status: 'EM_TRAMITACAO',
            tipo: { id: 't1', nome: 'ELOM', sigla: 'ELOM' },
        },
    } as PautaItemDetalhe;
}

describe('PautaDetalhePanel — item do painel', () => {
    it('mostra Exibir no telão mesmo com sessão AGENDADA (antes de iniciar)', () => {
        render(
            <PautaDetalhePanel
                sessaoId="s1"
                statusSessao="AGENDADA"
                item={itemPublicado()}
                somenteLeitura={false}
                podeDeliberar={false}
                onRemover={vi.fn()}
                onAbrirVotacao={vi.fn()}
                onFecharVotacao={vi.fn()}
                onExibirNoPainel={vi.fn()}
            />,
        );

        expect(
            screen.getByRole('button', { name: /Exibir no telão/i }),
        ).toBeInTheDocument();
    });

    it('oculta Exibir no telão quando callback não é passado', () => {
        render(
            <PautaDetalhePanel
                sessaoId="s1"
                statusSessao="AGENDADA"
                item={itemPublicado()}
                somenteLeitura={false}
                podeDeliberar={false}
                onRemover={vi.fn()}
                onAbrirVotacao={vi.fn()}
                onFecharVotacao={vi.fn()}
            />,
        );

        expect(
            screen.queryByRole('button', { name: /Exibir no telão/i }),
        ).not.toBeInTheDocument();
    });

    it('mostra Fechar votação como botão sólido quando deliberação ativa', () => {
        const item = itemPublicado();
        item.materia = {
            ...item.materia!,
            status: 'EM_VOTACAO',
        };
        item.votacao = {
            id: 'v1',
            tipoVotacao: 'NOMINAL',
            votosSim: 0,
            votosNao: 0,
            abstencoes: 0,
            finalizada: false,
        };

        render(
            <PautaDetalhePanel
                sessaoId="s1"
                statusSessao="ABERTA"
                item={item}
                somenteLeitura={false}
                podeDeliberar
                onRemover={vi.fn()}
                onAbrirVotacao={vi.fn()}
                onFecharVotacao={vi.fn()}
                onExibirNoPainel={vi.fn()}
            />,
        );

        const btn = screen.getByRole('button', { name: /Fechar votação/i });
        expect(btn.className).toContain('pauta-fechar-votacao-btn');
    });
});
