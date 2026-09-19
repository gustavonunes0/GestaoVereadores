import type { PanelStats } from './types';

export function StatsBlock({ stats }: { stats: PanelStats }) {
    return (
        <div
            className="vp-stats"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Parlamentares ${stats.parlamentares}, ausentes ${stats.ausentes}`}
        >
            <div className="vp-stats__row" aria-hidden>
                <span>PARLAMENTARES</span>
                <strong>{String(stats.parlamentares).padStart(2, '0')}</strong>
            </div>
            <div className="vp-stats__row" aria-hidden>
                <span>AUSENTES</span>
                <strong>{String(stats.ausentes).padStart(2, '0')}</strong>
            </div>
        </div>
    );
}
