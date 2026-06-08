/**
 * Tipos de parecer de comissão — contrato para evolução pós-MVP.
 * Persistência e fluxo completo ficam para task futura.
 */

export enum CommitteeOpinionStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export enum CommitteeOpinionRecommendation {
    FAVORABLE = 'FAVORABLE',
    UNFAVORABLE = 'UNFAVORABLE',
    WITH_SUGGESTIONS = 'WITH_SUGGESTIONS',
    NO_OPINION = 'NO_OPINION',
}

export type CommitteeOpinionSummary = {
    id: string;
    tenantId: string;
    committeeId: string;
    matterId: string;
    status: CommitteeOpinionStatus;
    recommendation: CommitteeOpinionRecommendation | null;
    rapporteurParliamentarianId: string | null;
    content: string | null;
    publishedAt: Date | null;
};

export type ListCommitteeOpinionsByMatterQuery = {
    tenantId: string;
    matterId: string;
    committeeId?: string;
};

export type FindCommitteeOpinionQuery = {
    tenantId: string;
    matterId: string;
    committeeId: string;
};
