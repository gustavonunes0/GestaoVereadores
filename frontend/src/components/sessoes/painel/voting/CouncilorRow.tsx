import { StatusDot } from './StatusDot';
import { ROLE_LABEL, type Councilor } from './types';

export function CouncilorRow({
    member,
    showRole,
}: {
    member: Councilor;
    showRole?: boolean;
}) {
    const roleLabel =
        showRole && member.role && member.role !== 'PRESIDENTE'
            ? ROLE_LABEL[member.role]
            : null;

    return (
        <li className="vp-row">
            <StatusDot status={member.status} name={member.name} />
            {roleLabel ? <span className="vp-row__role">{roleLabel}</span> : null}
            <span className="vp-row__name">{member.name.toUpperCase()}</span>
            {member.party ? (
                <span className="vp-row__party">{member.party}</span>
            ) : (
                <span className="vp-row__party vp-row__party--empty" />
            )}
        </li>
    );
}
