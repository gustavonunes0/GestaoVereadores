import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import { PoliticalPartyDomainService } from '../../../partidos-politicos/domain/services/political-party-domain.service';

/**
 * Parlamentar é ator legislativo ligado ao Tenant.
 * Acesso ao sistema é opcional via ParlamentarianUser.
 */
export class ParliamentarianDomainService {
    assertNoDuplicateAccess(exists: boolean) {
        if (exists) {
            throw new Error('Parlamentar já possui acesso ao sistema');
        }
    }

    assertPoliticalPartyUsable(
        party: PoliticalPartyEntity | null,
        tenantId: string,
    ) {
        const partyService = new PoliticalPartyDomainService();
        partyService.assertPartyUsableForParliamentarian(party, tenantId);
    }
}
