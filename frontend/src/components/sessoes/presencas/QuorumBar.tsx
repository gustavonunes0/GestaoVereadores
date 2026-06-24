import type { PresencaSessao } from '../../../types/presenca';

export function QuorumBar({ presenca }: { presenca: PresencaSessao }) {
    const { presentes, totalMembros, quorumMinimo, temQuorum } = presenca;
    const fillPct = Math.round((presentes / totalMembros) * 100);
    const markerPct = Math.round((quorumMinimo / totalMembros) * 100);

    return (
        <div className="quorum-wrap">
            <div className="quorum-labels">
                <span>Progresso do quórum</span>
                <span
                    className="quorum-status"
                    style={{ color: temQuorum ? 'var(--green-700)' : 'var(--amber-700)' }}
                >
                    {temQuorum
                        ? `Quórum atingido (${presentes}/${quorumMinimo})`
                        : `Faltam ${quorumMinimo - presentes} (${presentes}/${quorumMinimo})`}
                </span>
            </div>
            <div className="quorum-track">
                <div
                    className="quorum-fill"
                    style={{
                        width: `${fillPct}%`,
                        background: temQuorum ? 'var(--green-500)' : 'var(--amber-600)',
                    }}
                />
                <div className="quorum-marker" style={{ left: `${markerPct}%` }}>
                    <span className="quorum-marker-label">mín.</span>
                </div>
            </div>
            <div className="quorum-hint">
                Quórum mínimo de instalação: maioria simples — {quorumMinimo} dos {totalMembros} membros.
            </div>
        </div>
    );
}
