import { Injectable } from '@nestjs/common';
import { MatterCommitteeOpinionGate } from '../../domain/contracts/matter-committee-opinion-gate';
import { MatterTramitationContext } from '../../domain/contracts/matter-tramitation-context';
import { assertTramitationNotBlockedByMissingOpinion } from '../../domain/policies/matter-tramitation-policy';

/**
 * Gate permissivo do MVP — não consulta pareceres; sempre permite tramitação.
 */
@Injectable()
export class MvpMatterCommitteeOpinionGate extends MatterCommitteeOpinionGate {
    async assertTramitationAllowed(
        context: MatterTramitationContext,
    ): Promise<void> {
        assertTramitationNotBlockedByMissingOpinion(context);
    }
}
