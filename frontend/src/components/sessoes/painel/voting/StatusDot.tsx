import { STATUS_ARIA, type CouncilorStatus } from './types';

export function StatusDot({
    status,
    name,
}: {
    status: CouncilorStatus;
    name?: string;
}) {
    const statusLabel = STATUS_ARIA[status];
    const label = name ? `${name}: ${statusLabel}` : statusLabel;

    return (
        <span
            className={`vp-dot vp-dot--${status}`}
            aria-label={label}
            role="img"
        />
    );
}
