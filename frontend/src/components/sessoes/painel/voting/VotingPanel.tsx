import { CouncilorColumn } from './CouncilorColumn';
import { PanelHeader } from './PanelHeader';
import { useClock } from './useClock';
import { useVoteTally } from './useVoteTally';
import { VoteFooter } from './VoteFooter';
import type { Councilor, VoteTotals, VotingPanelMode } from './types';

const RESULTADO_LABEL: Record<string, string> = {
    APROVADO: 'APROVADO',
    REJEITADO: 'REJEITADO',
    EMPATE: 'EMPATE',
    EMPATADO: 'EMPATE',
    ADIADO: 'ADIADO',
};

export function VotingPanel({
    institutionName,
    logoSrc,
    president,
    left,
    right,
    all,
    votes,
    mode = 'live',
    materiaTitulo,
    resultado,
}: {
    institutionName: string;
    logoSrc?: string | null;
    president: Councilor | null;
    left: Councilor[];
    right: Councilor[];
    all: Councilor[];
    votes: VoteTotals;
    mode?: VotingPanelMode;
    materiaTitulo?: string;
    resultado?: string | null;
}) {
    const { clock, dateLabel } = useClock();
    const { votes: tallyVotes, stats } = useVoteTally(all, votes);
    const resultadoLabel = resultado
        ? RESULTADO_LABEL[resultado] ?? resultado.toUpperCase()
        : null;

    const title = institutionName.toUpperCase().startsWith('CÂMARA')
        ? institutionName.toUpperCase()
        : `CÂMARA MUNICIPAL DE ${institutionName.toUpperCase()}`;

    const leftColumn = president ? [president, ...left] : left;
    const mesaCount = leftColumn.length;
    const awaitingCount = right.filter((m) => m.status === 'presente').length;

    return (
        <section
            className={`voting-panel voting-panel--dashboard voting-panel--compact${
                mode === 'result' ? ' voting-panel--result' : ''
            }`}
            aria-label="Painel eletrônico de votação"
        >
            <PanelHeader
                title={title}
                logoSrc={logoSrc}
                materiaTitulo={materiaTitulo}
                mode={mode}
                resultadoLabel={resultadoLabel}
            />

            <div className="vp-body">
                <article className="vp-card vp-card--mesa">
                    <header className="vp-card__head">
                        <h2 className="vp-card__label">
                            <span className="vp-card__accent" aria-hidden />
                            Mesa Diretora
                        </h2>
                        <span className="vp-card__meta vp-card__meta--muted">
                            {mesaCount} Membros
                        </span>
                    </header>
                    <CouncilorColumn
                        side="left"
                        members={leftColumn}
                        showRole
                    />
                </article>

                <article className="vp-card vp-card--members">
                    <header className="vp-card__head">
                        <h2 className="vp-card__label">
                            <span className="vp-card__accent" aria-hidden />
                            Parlamentares
                        </h2>
                        <div className="vp-card__head-meta">
                            {mode === 'live' ? (
                                <span className="vp-card__awaiting">
                                    <span
                                        className="vp-card__awaiting-dot"
                                        aria-hidden
                                    />
                                    Aguardando Votação
                                </span>
                            ) : null}
                            <span className="vp-card__meta">
                                Total: {right.length.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </header>
                    <CouncilorColumn side="right" members={right} />
                    {mode === 'live' && awaitingCount > 0 ? (
                        <span className="sr-only">
                            {awaitingCount} parlamentares aguardando votação
                        </span>
                    ) : null}
                </article>
            </div>

            <VoteFooter
                clock={clock}
                date={dateLabel}
                votes={tallyVotes}
                stats={stats}
            />
        </section>
    );
}
