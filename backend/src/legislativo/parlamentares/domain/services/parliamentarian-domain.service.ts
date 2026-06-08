import { TenantUserEntity } from '../../../../identidade/tenant-users/domain/entities/tenant-user.entity';
import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import { PoliticalPartyDomainService } from '../../../partidos-politicos/domain/services/political-party-domain.service';

/**
 * Parlamentar é perfil legislativo de TenantUser (tenantUserId obrigatório).
 * Não usa Pessoa nem userId direto — identidade vem via TenantUser → User.
 */
export class ParliamentarianDomainService {
    assertTenantUserIdProvided(tenantUserId?: string) {
        if (!tenantUserId?.trim()) {
            throw new Error('Vínculo TenantUser é obrigatório para parlamentar');
        }
    }

    assertTenantUserIsParliamentarian(tenantUser: TenantUserEntity | null) {
        if (!tenantUser) {
            throw new Error('Usuário do tenant não encontrado');
        }
        if (!tenantUser.isParliamentarian) {
            throw new Error(
                'Este usuário do tenant não está marcado como parlamentar.',
            );
        }
    }

    assertNoDuplicate(exists: boolean) {
        if (exists) {
            throw new Error(
                'Já existe parlamentar para este usuário do tenant',
            );
        }
    }

    assertPoliticalPartyUsable(
        party: PoliticalPartyEntity | null,
        tenantId: string,
    ) {
        const partyService = new PoliticalPartyDomainService();
        partyService.assertPartyUsableForParliamentarian(party, tenantId);
    }

    validateTenantUserForCreation(
        tenantUser: TenantUserEntity | null,
        duplicateExists: boolean,
    ) {
        this.assertTenantUserIsParliamentarian(tenantUser);
        this.assertNoDuplicate(duplicateExists);
    }
}
