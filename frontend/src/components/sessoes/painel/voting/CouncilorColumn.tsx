import { CouncilorRow } from './CouncilorRow';
import type { Councilor } from './types';

export function CouncilorColumn({
    side,
    members,
    showRole,
}: {
    side: 'left' | 'right';
    members: Councilor[];
    showRole?: boolean;
}) {
    return (
        <ul
            className={`vp-column vp-column--${side}`}
            aria-label={side === 'left' ? 'Mesa diretora' : 'Vereadores'}
        >
            {members.length === 0 ? (
                <li className="vp-row vp-row--empty">—</li>
            ) : (
                members.map((m) => (
                    <CouncilorRow key={m.id} member={m} showRole={showRole} />
                ))
            )}
        </ul>
    );
}
