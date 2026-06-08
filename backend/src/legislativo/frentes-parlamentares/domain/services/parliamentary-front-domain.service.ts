/**
 * Frentes suprapartidárias da Câmara — não substituem comissão nem exigem parecer.
 */
export class ParliamentaryFrontDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para frente parlamentar');
        }
    }

    assertDateRange(startDate: Date | null, endDate: Date | null) {
        if (
            startDate &&
            endDate &&
            endDate.getTime() < startDate.getTime()
        ) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    assertThemeProvided(theme?: string) {
        if (!theme?.trim()) {
            throw new Error('Tema da frente é obrigatório');
        }
    }

    assertParliamentarianNotOnFront(alreadyMember: boolean) {
        if (alreadyMember) {
            throw new Error('Parlamentar já integra esta frente parlamentar');
        }
    }

    /** Frentes são suprapartidárias — partido do parlamentar não restringe adesão. */
    assertMemberEligibleForFront() {
        return;
    }
}
