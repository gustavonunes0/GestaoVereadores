import { LegislatureEntity } from '../entities/legislature.entity';

/**
 * Legislatura é o período institucional da Câmara, sempre vinculada a um tenant.
 */
export class LegislatureDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para legislatura');
        }
    }

    assertBelongsToTenant(
        legislature: LegislatureEntity | null,
        tenantId: string,
    ) {
        if (!legislature || legislature.tenantId !== tenantId) {
            throw new Error('Legislatura não encontrada');
        }
    }

    assertNumberAvailable(exists: boolean) {
        if (exists) {
            throw new Error('Já existe legislatura com este número');
        }
    }

    assertCanRemove(activeMandateCount: number) {
        if (activeMandateCount > 0) {
            throw new Error(
                'Não é possível remover legislatura com mandatos ativos vinculados.',
            );
        }
    }

    assertDateRange(startDate: Date, endDate: Date | null | undefined) {
        if (endDate && endDate.getTime() < startDate.getTime()) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    assertAtMostOneCurrent(currentCount: number) {
        if (currentCount > 1) {
            throw new Error(
                'Apenas uma legislatura pode ser atual por tenant',
            );
        }
    }

    validateForCreation(
        tenantId: string,
        startDate: Date,
        endDate: Date | null | undefined,
        numberExists: boolean,
    ) {
        this.assertTenantIdProvided(tenantId);
        this.assertNumberAvailable(numberExists);
        this.assertDateRange(startDate, endDate);
    }
}
