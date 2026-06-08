export enum CommitteeMemberRole {
    PRESIDENT = 'PRESIDENT',
    RAPPORTEUR = 'RAPPORTEUR',
    MEMBER = 'MEMBER',
}

export const COMMITTEE_MEMBER_ROLE_LABELS: Record<CommitteeMemberRole, string> =
    {
        [CommitteeMemberRole.PRESIDENT]: 'Presidente',
        [CommitteeMemberRole.RAPPORTEUR]: 'Relator',
        [CommitteeMemberRole.MEMBER]: 'Membro',
    };

export const EXCLUSIVE_COMMITTEE_MEMBER_ROLES = [
    CommitteeMemberRole.PRESIDENT,
    CommitteeMemberRole.RAPPORTEUR,
] as const;
