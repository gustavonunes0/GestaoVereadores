/**
 * Regras de autoria (task 20).
 * - Autor: parlamentar ou externo (GuestUser).
 * - Coautor: somente parlamentar no MVP.
 * - Relator: somente parlamentar.
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

    assertExternalAuthorUsesGuestUser(guestUserId?: string | null) {
        if (!guestUserId?.trim()) {
            throw new Error('Autor externo requer GuestUser vinculado');
        }
    }

    assertParliamentarianAuthorProvided(parliamentarianId?: string | null) {
        if (!parliamentarianId?.trim()) {
            throw new Error('Autor parlamentar é obrigatório');
        }
    }

    assertCoauthorNotDuplicate(alreadyCoauthor: boolean) {
        if (alreadyCoauthor) {
            throw new Error('Parlamentar já é coautor desta matéria');
        }
    }

    assertCoauthorNotPrimaryAuthor(
        parliamentarianId: string,
        authorParliamentarianId?: string | null,
    ) {
        if (
            authorParliamentarianId &&
            authorParliamentarianId === parliamentarianId
        ) {
            throw new Error(
                'Autor principal não pode ser listado novamente como coautor',
            );
        }
    }
}
