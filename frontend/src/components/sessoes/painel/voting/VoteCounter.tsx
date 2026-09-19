export function VoteCounter({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'sim' | 'nao' | 'abs';
}) {
    const display = String(value).padStart(2, '0');
    const fullLabel =
        tone === 'sim' ? 'Sim' : tone === 'nao' ? 'Não' : 'Abstenções';

    return (
        <div
            className={`vp-counter vp-counter--${tone}`}
            aria-label={`${fullLabel}: ${display}`}
        >
            <span className="vp-counter__label" aria-hidden>
                {label}
            </span>
            <span className="vp-counter__value" aria-hidden>
                {display}
            </span>
        </div>
    );
}
