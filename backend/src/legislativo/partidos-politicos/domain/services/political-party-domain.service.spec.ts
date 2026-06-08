import { PoliticalPartyDomainService } from './political-party-domain.service';
import { buildPoliticalPartyEntity } from '../../application/use-cases/__tests__/political-party-test.helpers';

describe('PoliticalPartyDomainService', () => {
    const service = new PoliticalPartyDomainService();

    it('exige tenantId', () => {
        expect(() => service.assertTenantIdProvided('')).toThrow(
            'Tenant é obrigatório para partido político',
        );
    });

    it('bloqueia remoção quando há parlamentares ativos', () => {
        expect(() => service.assertCanRemove(2)).toThrow(
            'Não é possível remover partido político vinculado a parlamentares ativos.',
        );
    });

    it('permite remoção quando não há parlamentares ativos', () => {
        expect(() => service.assertCanRemove(0)).not.toThrow();
    });

    it('bloqueia sigla duplicada', () => {
        expect(() => service.assertAcronymAvailable(true)).toThrow(
            'Já existe partido político com esta sigla',
        );
    });

    it('bloqueia nome duplicado', () => {
        expect(() => service.assertNameAvailable(true)).toThrow(
            'Já existe partido político com este nome',
        );
    });

    it('bloqueia partido removido para parlamentar', () => {
        const removed = buildPoliticalPartyEntity({ isRemoved: true });
        expect(() =>
            service.assertPartyUsableForParliamentarian(removed, 'tenant-1'),
        ).toThrow('Partido político removido não pode ser utilizado');
    });

    it('bloqueia partido de outro tenant', () => {
        const party = buildPoliticalPartyEntity({ tenantId: 'tenant-2' });
        expect(() =>
            service.assertPartyUsableForParliamentarian(party, 'tenant-1'),
        ).toThrow('Partido político não pertence a este tenant');
    });

    it('permite partido ativo do mesmo tenant', () => {
        const party = buildPoliticalPartyEntity();
        expect(() =>
            service.assertPartyUsableForParliamentarian(party, 'tenant-1'),
        ).not.toThrow();
    });

    it('consolida validações de criação', () => {
        expect(() =>
            service.validateForCreation('tenant-1', false, false),
        ).not.toThrow();
    });
});
