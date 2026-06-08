import { TenantUserEntity, TenantUserStatus } from '../../../../identidade/tenant-users/domain/entities/tenant-user.entity';
import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import { ParliamentarianDomainService } from './parliamentarian-domain.service';

describe('ParliamentarianDomainService', () => {
    const service = new ParliamentarianDomainService();

    const buildTenantUser = (isParliamentarian: boolean) =>
        TenantUserEntity.restore({
            id: 'tu-1',
            tenantId: 'tenant-1',
            userId: 'user-1',
            isTenantAdmin: false,
            isTenantStaff: false,
            isParliamentarian,
            status: TenantUserStatus.ACTIVE,
            permissions: [],
            lastAccessAt: null,
            removedAt: null,
            createdAt: new Date(),
            createdBy: null,
            modifiedAt: new Date(),
            modifiedBy: null,
            isRemoved: false,
        });

    it('bloqueia criação se isParliamentarian for false', () => {
        expect(() =>
            service.assertTenantUserIsParliamentarian(
                buildTenantUser(false),
            ),
        ).toThrow(
            'Este usuário do tenant não está marcado como parlamentar.',
        );
    });

    it('permite criação se isParliamentarian for true', () => {
        expect(() =>
            service.assertTenantUserIsParliamentarian(buildTenantUser(true)),
        ).not.toThrow();
    });

    it('bloqueia duplicidade para o mesmo tenantUserId', () => {
        expect(() => service.assertNoDuplicate(true)).toThrow(
            'Já existe parlamentar para este usuário do tenant',
        );
    });

    it('exige tenantUserId na criação', () => {
        expect(() => service.assertTenantUserIdProvided('')).toThrow(
            'Vínculo TenantUser é obrigatório para parlamentar',
        );
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
