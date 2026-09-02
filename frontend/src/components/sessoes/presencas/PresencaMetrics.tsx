import type { PresencaSessao } from '../../../types/presenca';

export function PresencaMetrics({ presenca }: { presenca: PresencaSessao }) {
    const cards = [
        { label: 'Presentes', valor: Math.round(presenca.presentes), mod: 'presente' },
        { label: 'Ausentes', valor: Math.round(presenca.ausentes), mod: 'ausente' },
        { label: 'Total de membros', valor: Math.round(presenca.totalMembros), mod: 'total' },
        { label: 'Quórum mínimo', valor: Math.round(presenca.quorumMinimo), mod: 'quorum' },
    ];

    return (
        <div className="presenca-metrics lex-presenca-metrics">
            {cards.map((c) => (
                <div key={c.label} className={`presenca-metric presenca-metric--${c.mod}`}>
                    <div className="presenca-metric-label">{c.label}</div>
                    <div className="presenca-metric-val">{c.valor}</div>
                </div>
            ))}
        </div>
    );
}
