import type { PresencaSessao } from '../../../types/presenca';

export function PresencaMetrics({ presenca }: { presenca: PresencaSessao }) {
    const cards = [
        { label: 'Presentes', valor: Math.round(presenca.presentes), cor: 'var(--green-700)' },
        { label: 'Ausentes', valor: Math.round(presenca.ausentes), cor: 'var(--text-color-secondary)' },
        { label: 'Total de membros', valor: Math.round(presenca.totalMembros), cor: 'var(--blue-600)' },
        { label: 'Quórum mínimo', valor: Math.round(presenca.quorumMinimo), cor: 'var(--amber-700)' },
    ];

    return (
        <div className="presenca-metrics">
            {cards.map((c) => (
                <div key={c.label} className="presenca-metric">
                    <div className="presenca-metric-label">{c.label}</div>
                    <div className="presenca-metric-val" style={{ color: c.cor }}>
                        {c.valor}
                    </div>
                </div>
            ))}
        </div>
    );
}
