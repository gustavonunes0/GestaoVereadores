import { CouncilorAvatar } from './CouncilorAvatar';
import { StatusDot } from './StatusDot';
import { ROLE_LABEL, type Councilor } from './types';

/** Rótulos da mesa no overlay do mock nova-ui. */
const MESA_ROLE_LABEL: Record<NonNullable<Councilor['role']>, string> = {
    PRESIDENTE: 'Presidente',
    VICE: 'Vice-Presidente',
    '1SEC': '1º Secretário',
    '2SEC': '2º Secretário',
};

export function CouncilorRow({
    member,
    showRole,
}: {
    member: Councilor;
    showRole?: boolean;
}) {
    const isPresident = member.role === 'PRESIDENTE';
    const isMesa = Boolean(showRole);
    const roleLabel = isMesa
        ? member.cargoLabel?.trim() ||
          (member.role ? MESA_ROLE_LABEL[member.role] : null) ||
          (member.role ? ROLE_LABEL[member.role] : null)
        : null;

    return (
        <li
            className={`vp-row vp-row--card${
                isPresident ? ' vp-row--president' : ''
            }${isMesa ? ' vp-row--mesa' : ' vp-row--member'}`}
        >
            <div className="vp-row__photo">
                <CouncilorAvatar
                    name={member.name}
                    photoUrl={member.photoUrl}
                    photoPosX={member.photoPosX}
                    photoPosY={member.photoPosY}
                    photoZoom={member.photoZoom}
                    highlighted={isPresident}
                />
                {roleLabel ? (
                    <span
                        className={`vp-row__role-badge${
                            isPresident ? ' vp-row__role-badge--president' : ''
                        }`}
                    >
                        {isPresident ? (
                            <i className="pi pi-star-fill" aria-hidden />
                        ) : null}
                        {roleLabel}
                    </span>
                ) : null}
                <StatusDot status={member.status} name={member.name} />
            </div>
            <div className="vp-row__info">
                <span className="vp-row__name">
                    {member.name.toUpperCase()}
                </span>
                {member.party ? (
                    <span className="vp-row__party">{member.party}</span>
                ) : (
                    <span className="vp-row__party vp-row__party--empty">—</span>
                )}
            </div>
        </li>
    );
}
