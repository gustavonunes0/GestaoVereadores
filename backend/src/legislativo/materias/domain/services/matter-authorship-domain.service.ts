/**
 * Regras de autoria da matéria.
 * 1. Exatamente um autor principal por matéria (parlamentar OU instituição parceira).
 * 2. Autor: ParliamentarianUser ou TenantPartnerUser (usuário vinculado obrigatório).
 * 3. Coautor: mesmas entidades do autor — vários permitidos.
 * 4. Relator: somente parlamentar com usuário vinculado.
 */
export class MatterAuthorshipDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para autoria da matéria');
        }
    }

    assertCoauthorMustBeParliamentarian() {
        return;
    }

    assertRapporteurMustBeParliamentarian() {
        return;
    }

    assertTenantPartnerAuthorProvided(tenantPartnerId?: string | null) {
        if (!tenantPartnerId?.trim()) {
            throw new Error('Instituição parceira autora é obrigatória');
        }
    }

    /** @deprecated Use assertTenantPartnerAuthorProvided */
    assertExternalAuthorProvided(tenantPartnerId?: string | null) {
        this.assertTenantPartnerAuthorProvided(tenantPartnerId);
    }

    assertParliamentarianAuthorProvided(parliamentarianId?: string | null) {
        if (!parliamentarianId?.trim()) {
            throw new Error('Autor parlamentar é obrigatório');
        }
    }

    assertCoauthorNotDuplicate(alreadyCoauthor: boolean) {
        if (alreadyCoauthor) {
            throw new Error('Este autor já é coautor desta matéria');
        }
    }

    assertCoauthorNotPrimaryAuthor(
        parliamentarianId: string | null | undefined,
        authorParliamentarianId?: string | null,
        tenantPartnerId?: string | null,
        authorTenantPartnerId?: string | null,
    ) {
        if (
            parliamentarianId &&
            authorParliamentarianId &&
            authorParliamentarianId === parliamentarianId
        ) {
            throw new Error(
                'Autor principal não pode ser listado novamente como coautor',
            );
        }
        if (
            tenantPartnerId &&
            authorTenantPartnerId &&
            authorTenantPartnerId === tenantPartnerId
        ) {
            throw new Error(
                'Autor principal não pode ser listado novamente como coautor',
            );
        }
    }
}
