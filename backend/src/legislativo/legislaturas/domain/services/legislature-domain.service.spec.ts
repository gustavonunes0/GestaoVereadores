import { LegislatureEntity } from '../entities/legislature.entity';
import { LegislatureDomainService } from './legislature-domain.service';

describe('LegislatureDomainService', () => {
    const service = new LegislatureDomainService();

    const legislature = LegislatureEntity.restore({
        id: 'leg-1',
        tenantId: 'tenant-1',
        number: 20,
        startDate: new Date('2025-01-01'),
        endDate: null,
        isCurrent: false,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    it('exige tenantId', () => {
        expect(() => service.assertTenantIdProvided('')).toThrow(
            'Tenant é obrigatório para legislatura',
        );
    });

    it('bloqueia número duplicado', () => {
        expect(() => service.assertNumberAvailable(true)).toThrow(
            'Já existe legislatura com este número',
        );
    });

    it('bloqueia remoção com mandatos ativos', () => {
        expect(() => service.assertCanRemove(1)).toThrow(
            'Não é possível remover legislatura com mandatos ativos vinculados.',
        );
    });

    it('valida intervalo de datas', () => {
        const start = new Date('2025-01-01');
        const end = new Date('2024-01-01');
        expect(() => service.assertDateRange(start, end)).toThrow(
            'Data fim não pode ser anterior à data início',
        );
    });

    it('garante no máximo uma legislatura atual', () => {
        expect(() => service.assertAtMostOneCurrent(2)).toThrow(
            'Apenas uma legislatura pode ser atual por tenant',
        );
    });

    it('valida pertencimento ao tenant', () => {
        expect(() =>
            service.assertBelongsToTenant(legislature, 'tenant-1'),
        ).not.toThrow();
        expect(() =>
            service.assertBelongsToTenant(legislature, 'tenant-2'),
        ).toThrow('Legislatura não encontrada');
    });

    it('consolida validações de criação', () => {
        expect(() =>
            service.validateForCreation(
                'tenant-1',
                new Date('2025-01-01'),
                new Date('2028-12-31'),
                false,
            ),
        ).not.toThrow();
    });
});
