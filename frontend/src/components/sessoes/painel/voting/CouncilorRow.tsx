import { CouncilorAvatar } from './CouncilorAvatar';
import { StatusDot } from './StatusDot';
import { ROLE_LABEL, type Councilor } from './types';

export function CouncilorRow({
    member,
    showRole,
}: {
    member: Councilor;
    showRole?: boolean;
}) {
    const isPresident = member.role === 'PRESIDENTE';
    const roleLabel =
        showRole && member.role && member.role !== 'PRESIDENTE'
            ? ROLE_LABEL[member.role]
            : isPresident && showRole
              ? 'PRESIDENTE'
              : null;

    return (
        <li className={`vp-row${isPresident ? ' vp-row--president' : ''}`}>
            {isPresident ? null : (
                <StatusDot status={member.status} name={member.name} />
            )}
            <CouncilorAvatar
                name={member.name}
                photoUrl={member.photoUrl}
                highlighted={isPresident}
            />
            <div className="vp-row__info">
                {roleLabel ? (
                    <span className="vp-row__role">{roleLabel}</span>
                ) : null}
                <span className="vp-row__name">{member.name.toUpperCase()}</span>
                {member.party ? (
                    <span className="vp-row__party">{member.party}</span>
                ) : null}
            </div>
        </li>
    );
}
