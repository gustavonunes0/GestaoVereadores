import { CouncilorColumn } from './CouncilorColumn';
import { PanelHeader } from './PanelHeader';
import { PresidentRow } from './PresidentRow';
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
    president,
    left,
    right,
    all,
    votes,
    mode = 'live',
    materiaTitulo,
    materiaEmenta,
    resultado,
}: {
    institutionName: string;
    president: Councilor | null;
    left: Councilor[];
    right: Councilor[];
    all: Councilor[];
    votes: VoteTotals;
    mode?: VotingPanelMode;
    materiaTitulo?: string;
    materiaEmenta?: string;
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

    return (
        <section
            className={`voting-panel${mode === 'result' ? ' voting-panel--result' : ''}`}
            aria-label="Painel eletrônico de votação"
        >
            <PanelHeader title={title} />
            {materiaTitulo ? (
                <div
                    className="vp-materia"
                    role="status"
                    aria-live="polite"
                    aria-label={
                        mode === 'live'
                            ? `Votação aberta: ${materiaTitulo}`
                            : `Resultado ${resultadoLabel ?? ''}: ${materiaTitulo}`
                    }
                >
                    <span className="vp-materia__badge" aria-hidden>
                        {mode === 'live' ? 'VOTAÇÃO ABERTA' : resultadoLabel ?? 'RESULTADO'}
                    </span>
                    <strong className="vp-materia__titulo" aria-hidden>
                        {materiaTitulo}
                    </strong>
                    {materiaEmenta ? (
                        <span className="vp-materia__ementa" aria-hidden>
                            {materiaEmenta}
                        </span>
                    ) : null}
                </div>
            ) : null}
            <PresidentRow president={president} />
            <div className="vp-body">
                <CouncilorColumn side="left" members={left} showRole />
                <div className="vp-body__divider" aria-hidden />
                <CouncilorColumn side="right" members={right} />
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
