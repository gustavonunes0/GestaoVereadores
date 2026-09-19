import type { PautaItemDetalhe } from '../../../types/sessoes';

export type PautaVotacaoPlacar = {
    status: 'encerrada' | 'em_andamento';
    statusLabel: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    resultado?: string | null;
};

export function resolvePautaVotacaoPlacar(
    votacao: PautaItemDetalhe['votacao'] | null | undefined,
): PautaVotacaoPlacar | null {
    if (!votacao) return null;
    const finalizada = Boolean(votacao.finalizada);
    return {
        status: finalizada ? 'encerrada' : 'em_andamento',
        statusLabel: finalizada ? 'Encerrada' : 'Em andamento',
        votosSim: votacao.votosSim ?? 0,
        votosNao: votacao.votosNao ?? 0,
        abstencoes: votacao.abstencoes ?? 0,
        resultado: votacao.resultado ?? null,
    };
}

type Props = {
    placar: PautaVotacaoPlacar;
};

/** Mini placar compacto — cores oficiais Sim/Não/Abstenção. */
export function PautaVotacaoMiniDashboard({ placar }: Props) {
    return (
        <div
            className="pauta-votacao-mini"
            aria-label={`Votação ${placar.statusLabel}: Sim ${placar.votosSim}, Não ${placar.votosNao}, Abstenção ${placar.abstencoes}`}
        >
            <span className="pauta-detalhe__meta-label">Votação</span>
            <div className="pauta-votacao-mini__body">
                <span
                    className={`pauta-votacao-mini__status pauta-votacao-mini__status--${placar.status}`}
                >
                    {placar.statusLabel}
                    {placar.resultado ? ` · ${placar.resultado}` : ''}
                </span>
                <div className="pauta-votacao-mini__placar">
                    <div className="pauta-votacao-mini__item pauta-votacao-mini__item--sim">
                        <span className="pauta-votacao-mini__valor voto-cor--sim">
                            {placar.votosSim}
                        </span>
                        <span className="pauta-votacao-mini__opcao">Sim</span>
                    </div>
                    <div className="pauta-votacao-mini__item pauta-votacao-mini__item--nao">
                        <span className="pauta-votacao-mini__valor voto-cor--nao">
                            {placar.votosNao}
                        </span>
                        <span className="pauta-votacao-mini__opcao">Não</span>
                    </div>
                    <div className="pauta-votacao-mini__item pauta-votacao-mini__item--abst">
                        <span className="pauta-votacao-mini__valor voto-cor--abstencao">
                            {placar.abstencoes}
                        </span>
                        <span className="pauta-votacao-mini__opcao">Abst.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
