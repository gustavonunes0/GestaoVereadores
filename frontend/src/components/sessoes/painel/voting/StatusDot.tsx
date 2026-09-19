import { STATUS_ARIA, type CouncilorStatus } from './types';

function hasVoted(status: CouncilorStatus): boolean {
    return (
        status === 'votou' ||
        status === 'sim' ||
        status === 'nao' ||
        status === 'abstencao'
    );
}

export function StatusDot({
    status,
    name,
}: {
    status: CouncilorStatus;
    name?: string;
}) {
    const statusLabel = STATUS_ARIA[status];
    const label = name ? `${name}: ${statusLabel}` : statusLabel;
    const voted = hasVoted(status);

    return (
        <span
            className={`vp-dot${voted ? ' vp-dot--votou' : ' vp-dot--pendente'}${
                status === 'ausente' ? ' vp-dot--ausente' : ''
            }`}
            aria-label={label}
            role="img"
        >
            {voted ? (
                <i className="pi pi-check vp-dot__check" aria-hidden />
            ) : null}
        </span>
    );
}
