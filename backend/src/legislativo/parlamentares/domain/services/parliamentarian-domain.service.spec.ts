import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import { ParliamentarianDomainService } from './parliamentarian-domain.service';

describe('ParliamentarianDomainService', () => {
    const service = new ParliamentarianDomainService();

    it('bloqueia duplicidade de acesso', () => {
        expect(() => service.assertNoDuplicateAccess(true)).toThrow(
            'Parlamentar já possui acesso ao sistema',
        );
    });

    it('permite quando não há acesso duplicado', () => {
        expect(() => service.assertNoDuplicateAccess(false)).not.toThrow();
    });

    it('valida partido utilizável pelo parlamentar', () => {
        const party = PoliticalPartyEntity.restore({
            id: 'party-1',
            tenantId: 'tenant-1',
            name: 'Partido',
            acronym: 'P',
            ideology: null,
            flagUrl: null,
            isRemoved: false,
            removedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        expect(() =>
            service.assertPoliticalPartyUsable(party, 'tenant-1'),
        ).not.toThrow();
    });

    it('bloqueia partido removido para parlamentar', () => {
        const party = PoliticalPartyEntity.restore({
            id: 'party-1',
            tenantId: 'tenant-1',
            name: 'Partido',
            acronym: 'P',
            ideology: null,
            flagUrl: null,
            isRemoved: true,
            removedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        expect(() =>
            service.assertPoliticalPartyUsable(party, 'tenant-1'),
        ).toThrow('Partido político removido não pode ser utilizado');
    });
});
