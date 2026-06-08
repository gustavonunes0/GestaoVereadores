import { AgendaLegislativaDomainService } from './agenda-legislativa-domain.service';

describe('AgendaLegislativaDomainService', () => {
    const service = new AgendaLegislativaDomainService();

    it('exige tenantId', () => {
        expect(() => service.assertTenantIdProvided('')).toThrow(
            'Tenant é obrigatório para agenda legislativa',
        );
    });

    it('valida intervalo de datas', () => {
        const inicio = new Date('2024-06-01');
        const fim = new Date('2024-05-01');

        expect(() => service.assertDateRange(inicio, fim)).toThrow(
            'Data final não pode ser anterior à data inicial',
        );
        expect(() => service.assertDateRange(inicio, null)).not.toThrow();
    });
});
