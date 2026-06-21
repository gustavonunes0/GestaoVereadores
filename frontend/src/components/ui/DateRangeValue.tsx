import { formatDateShort } from './date-utils';

interface DateRangeValueProps {
    range: [Date | null, Date | null];
    /** Exibe placeholder do fim enquanto o usuário seleciona o período. */
    showEndPlaceholder?: boolean;
}

export function DateRangeValue({ range, showEndPlaceholder = false }: DateRangeValueProps) {
    const [start, end] = range;

    if (!start && !end) return null;

    return (
        <span className="sigl-date-range-value flex items-center gap-1.5 min-w-0 flex-1">
            {start ? (
                <span className="sigl-date-range-tag" title={formatDateShort(start)}>
                    {formatDateShort(start)}
                </span>
            ) : null}
            {start && (end || showEndPlaceholder) ? (
                <>
                    <span className="sigl-date-range-separator" aria-hidden="true">
                        —
                    </span>
                    {end ? (
                        <span className="sigl-date-range-tag" title={formatDateShort(end)}>
                            {formatDateShort(end)}
                        </span>
                    ) : (
                        <span className="sigl-date-range-tag sigl-date-range-tag--placeholder">
                            Fim
                        </span>
                    )}
                </>
            ) : null}
        </span>
    );
}
