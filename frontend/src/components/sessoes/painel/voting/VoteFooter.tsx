import { ClockBlock } from './ClockBlock';
import { StatsBlock } from './StatsBlock';
import { VoteCounter } from './VoteCounter';
import type { PanelStats, VoteTotals } from './types';

export function VoteFooter({
    clock,
    date,
    votes,
    stats,
}: {
    clock: string;
    date: string;
    votes: VoteTotals;
    stats: PanelStats;
}) {
    return (
        <footer className="vp-footer">
            <div className="vp-card vp-card--clock">
                <span className="vp-card__label">Horário</span>
                <ClockBlock clock={clock} date={date} />
            </div>
            <div
                className="vp-card vp-card--placar"
                role="status"
                aria-live="polite"
                aria-atomic="true"
            >
                <span className="vp-card__label">Placar</span>
                <div className="vp-footer__counters">
                    <VoteCounter label="SIM" value={votes.sim} tone="sim" />
                    <VoteCounter label="NÃO" value={votes.nao} tone="nao" />
                    <VoteCounter label="ABS" value={votes.abs} tone="abs" />
                </div>
            </div>
            <div className="vp-card vp-card--stats">
                <span className="vp-card__label">Presença</span>
                <StatsBlock stats={stats} />
            </div>
        </footer>
    );
}
