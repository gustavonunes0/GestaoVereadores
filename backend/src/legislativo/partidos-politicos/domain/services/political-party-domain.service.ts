import { PoliticalPartyEntity } from '../entities/political-party.entity';

/**
 * Partido político é cadastro tenant-scoped usado por parlamentares.
 */
export class PoliticalPartyDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para partido político');
        }
    }

    assertBelongsToTenant(party: PoliticalPartyEntity | null, tenantId: string) {
        if (!party || party.tenantId !== tenantId) {
            throw new Error('Partido político não encontrado');
        }
    }

    assertCanRemove(activeParliamentarianCount: number) {
        if (activeParliamentarianCount > 0) {
            throw new Error(
                'Não é possível remover partido político vinculado a parlamentares ativos.',
            );
        }
    }

    assertAcronymAvailable(exists: boolean) {
        if (exists) {
            throw new Error('Já existe partido político com esta sigla');
        }
    }

    assertNameAvailable(exists: boolean) {
        if (exists) {
            throw new Error('Já existe partido político com este nome');
        }
    }

    assertPartyUsable(party: PoliticalPartyEntity | null) {
        if (!party) {
            throw new Error('Partido político não encontrado');
        }
        if (party.isRemoved) {
            throw new Error('Partido político removido não pode ser utilizado');
        }
    }

    assertPartyUsableForParliamentarian(
        party: PoliticalPartyEntity | null,
        tenantId: string,
    ) {
        if (!party) {
            throw new Error('Partido político não encontrado');
        }
        if (party.tenantId !== tenantId) {
            throw new Error('Partido político não pertence a este tenant');
        }
        if (party.isRemoved) {
            throw new Error('Partido político removido não pode ser utilizado');
        }
    }

    validateForCreation(
        tenantId: string,
        acronymExists: boolean,
        nameExists: boolean,
    ) {
        this.assertTenantIdProvided(tenantId);
        this.assertAcronymAvailable(acronymExists);
        this.assertNameAvailable(nameExists);
    }
}
