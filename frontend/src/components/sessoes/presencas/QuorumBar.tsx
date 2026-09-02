import type { PresencaSessao } from '../../../types/presenca';

/** Maioria simples para instalação (independente de modo teste na API). */
function quorumInstalacao(totalMembros: number): number {
    if (totalMembros <= 0) return 1;
    return Math.ceil(totalMembros / 2) + 1;
}

export function QuorumBar({ presenca }: { presenca: PresencaSessao }) {
    const { presentes, totalMembros } = presenca;
    const minInstalacao = quorumInstalacao(totalMembros);
    const atingiuQuorum = presentes >= minInstalacao;
    const fillPct =
        totalMembros > 0 ? Math.min(100, Math.round((presentes / totalMembros) * 100)) : 0;
    const markerPct =
        totalMembros > 0 ? Math.min(100, Math.round((minInstalacao / totalMembros) * 100)) : 0;

    return (
        <div className="quorum-wrap">
            <div className="quorum-labels">
                <span>Progresso do quórum</span>
                <span
                    className="quorum-status"
                    style={{ color: atingiuQuorum ? 'var(--green-700)' : 'var(--amber-700)' }}
                >
                    {atingiuQuorum
                        ? `Quórum atingido (${presentes}/${totalMembros})`
                        : `Faltam ${minInstalacao - presentes} (${presentes}/${totalMembros})`}
                </span>
            </div>
            <div className="quorum-track">
                <div
                    className="quorum-fill"
                    style={{
                        width: `${fillPct}%`,
                        background: atingiuQuorum ? 'var(--green-500)' : 'var(--amber-600)',
                    }}
                />
                <div
                    className="quorum-marker"
                    style={{ left: `clamp(8%, ${markerPct}%, 92%)` }}
                >
                    <span className="quorum-marker-label">mín.</span>
                </div>
            </div>
            <div className="quorum-hint">
                Quórum mínimo de instalação: maioria simples — {minInstalacao} dos{' '}
                {totalMembros} membros.
            </div>
        </div>
    );
}
