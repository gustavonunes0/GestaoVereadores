/**
 * Mesa Diretora com período configurável (sem mandato fixo de 2 anos).
 */
export class BoardDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para mesa diretora');
        }
    }

    assertDateRange(startDate: Date, endDate: Date | null | undefined) {
        if (endDate && endDate.getTime() < startDate.getTime()) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    assertRoleNotOccupied(roleOccupied: boolean) {
        if (roleOccupied) {
            throw new Error('Este cargo já está ocupado nesta mesa diretora');
        }
    }

    assertParliamentarianNotOnBoard(alreadyMember: boolean) {
        if (alreadyMember) {
            throw new Error(
                'Parlamentar já integra esta mesa diretora',
            );
        }
    }

    assertRoleNameAvailable(exists: boolean) {
        if (exists) {
            throw new Error('Já existe cargo da mesa com este nome');
        }
    }
}
