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
            <div className="vp-footer__strip" aria-hidden />
            <div className="vp-footer__body">
                <ClockBlock clock={clock} date={date} />
                <div
                    className="vp-footer__counters"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <VoteCounter label="SIM" value={votes.sim} tone="sim" />
                    <VoteCounter label="NÃO" value={votes.nao} tone="nao" />
                    <VoteCounter label="ABS" value={votes.abs} tone="abs" />
                </div>
                <StatsBlock stats={stats} />
            </div>
        </footer>
    );
}
