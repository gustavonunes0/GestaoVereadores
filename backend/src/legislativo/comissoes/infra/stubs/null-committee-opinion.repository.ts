import { Injectable } from '@nestjs/common';
import { CommitteeOpinionRepository } from '../../domain/repositories/committee-opinion.repository';
import {
    FindCommitteeOpinionQuery,
    ListCommitteeOpinionsByMatterQuery,
} from '../../domain/contracts/committee-opinion.types';

/**
 * Stub do MVP — sem tabela de pareceres; retorna vazio até implementação futura.
 */
@Injectable()
export class NullCommitteeOpinionRepository extends CommitteeOpinionRepository {
    async findByMatterAndCommittee(_query: FindCommitteeOpinionQuery) {
        return null;
    }

    async listByMatter(_query: ListCommitteeOpinionsByMatterQuery) {
        return [];
    }
}
