import {
    CommitteeOpinionSummary,
    FindCommitteeOpinionQuery,
    ListCommitteeOpinionsByMatterQuery,
} from '../contracts/committee-opinion.types';

/**
 * Porta de persistência de pareceres — não implementada no MVP.
 * Implementações futuras: PrismaCommitteeOpinionRepository.
 */
export abstract class CommitteeOpinionRepository {
    abstract findByMatterAndCommittee(
        query: FindCommitteeOpinionQuery,
    ): Promise<CommitteeOpinionSummary | null>;

    abstract listByMatter(
        query: ListCommitteeOpinionsByMatterQuery,
    ): Promise<CommitteeOpinionSummary[]>;
}
