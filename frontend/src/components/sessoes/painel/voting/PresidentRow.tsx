import { StatusDot } from './StatusDot';
import type { Councilor } from './types';

export function PresidentRow({ president }: { president: Councilor | null }) {
    if (!president) {
        return (
            <div className="vp-president vp-president--empty" aria-label="Presidente não informado">
                <span className="vp-president__label">PRESIDENTE</span>
                <span className="vp-president__name">—</span>
            </div>
        );
    }

    return (
        <div className="vp-president">
            <StatusDot status={president.status} name={`Presidente ${president.name}`} />
            <span className="vp-president__label">PRESIDENTE</span>
            <span className="vp-president__name">{president.name.toUpperCase()}</span>
            {president.party ? (
                <span className="vp-president__party">{president.party}</span>
            ) : null}
        </div>
    );
}
