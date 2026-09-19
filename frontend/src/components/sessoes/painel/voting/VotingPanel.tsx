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
    const hasMateria = Boolean(materiaTitulo);

    return (
        <section
            className={`voting-panel voting-panel--dashboard voting-panel--compact${
                hasMateria ? ' voting-panel--with-materia' : ''
            }${mode === 'result' ? ' voting-panel--result' : ''}`}
            aria-label="Painel eletrônico de votação"
        >
            <PanelHeader title={title} logoSrc={logoSrc} />
            {hasMateria ? (
                <div
                    className="vp-card vp-materia"
                    role="status"
                    aria-live="polite"
                    aria-label={
                        mode === 'live'
                            ? `Votação aberta: ${materiaTitulo}`
                            : `Resultado ${resultadoLabel ?? ''}: ${materiaTitulo}`
                    }
                >
                    <span className="vp-card__label">Matéria em votação</span>
                    <div className="vp-materia__grid">
                        <span className="vp-materia__badge">
                            {mode === 'live'
                                ? 'VOTAÇÃO ABERTA'
                                : resultadoLabel ?? 'RESULTADO'}
                        </span>
                        <strong className="vp-materia__titulo">
                            {materiaTitulo}
                        </strong>
                    </div>
                </div>
            ) : null}
            <div className="vp-body">
                <article className="vp-card vp-card--mesa">
                    <header className="vp-card__head">
                        <h2 className="vp-card__label">Mesa diretora</h2>
                    </header>
                    <CouncilorColumn
                        side="left"
                        members={leftColumn}
                        showRole
                    />
                </article>
                <article className="vp-card vp-card--members">
                    <header className="vp-card__head">
                        <h2 className="vp-card__label">Parlamentares</h2>
                        <span className="vp-card__meta">
                            {right.length.toString().padStart(2, '0')}
                        </span>
                    </header>
                    <CouncilorColumn side="right" members={right} />
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
