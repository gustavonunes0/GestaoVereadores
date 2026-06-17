import { TenantUserEntity, TenantUserStatus } from '../../../../identidade/tenant-users/domain/entities/tenant-user.entity';
import { UserEntity } from '../../../../identidade/users/domain/user.entity';
import { CreateParliamentarianUseCase } from './create-parliamentarian.use-case';
import {
    ParliamentarianCpfAlreadyInUseError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
} from '../errors/parliamentarian.errors';
import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
    buildPoliticalPartyRepositoryMock,
    buildTenantUserRepositoryMock,
} from './__tests__/parliamentarian-test.helpers';

function buildUserRepositoryMock() {
    return {
        create: jest.fn(),
        findByEmail: jest.fn(),
        findByCpf: jest.fn().mockResolvedValue(null),
    };
}

function buildPasswordHasherMock() {
    return {
        hash: jest.fn().mockResolvedValue('hashed-password'),
    };
}

describe('CreateParliamentarianUseCase', () => {
    const dto = {
        cpf: '529.982.247-25',
        password: 'senha-segura',
        parliamentaryName: 'Vereador Teste',
    };

    function buildUseCase(overrides: {
        parliamentarianRepository?: ReturnType<typeof buildParliamentarianRepositoryMock>;
        tenantUserRepository?: ReturnType<typeof buildTenantUserRepositoryMock>;
        politicalPartyRepository?: ReturnType<typeof buildPoliticalPartyRepositoryMock>;
        userRepository?: ReturnType<typeof buildUserRepositoryMock>;
        passwordHasher?: ReturnType<typeof buildPasswordHasherMock>;
    } = {}) {
        const parliamentarianRepository =
            overrides.parliamentarianRepository ??
            buildParliamentarianRepositoryMock();
        const tenantUserRepository =
            overrides.tenantUserRepository ?? buildTenantUserRepositoryMock();
        const politicalPartyRepository =
            overrides.politicalPartyRepository ??
            buildPoliticalPartyRepositoryMock();
        const userRepository =
            overrides.userRepository ?? buildUserRepositoryMock();
        const passwordHasher =
            overrides.passwordHasher ?? buildPasswordHasherMock();

        parliamentarianRepository.create.mockResolvedValue(
            buildParliamentarianWithRelations(),
        );
        userRepository.create.mockImplementation(async (user: UserEntity) => user);
        tenantUserRepository.create.mockImplementation(
            async (tenantUser: TenantUserEntity) => tenantUser,
        );

        return {
            useCase: new CreateParliamentarianUseCase(
                parliamentarianRepository as never,
                tenantUserRepository as never,
                userRepository as never,
                passwordHasher as never,
                politicalPartyRepository as never,
            ),
            parliamentarianRepository,
            tenantUserRepository,
            userRepository,
            passwordHasher,
            politicalPartyRepository,
        };
    }

    it('cria parlamentar provisionando User e TenantUser com CPF e senha informados', async () => {
        const { useCase, tenantUserRepository, userRepository, parliamentarianRepository, passwordHasher } =
            buildUseCase();

        const result = await useCase.execute('tenant-1', dto);
        const createdUser = userRepository.create.mock.calls[0][0] as UserEntity;
        const createdTenantUser = tenantUserRepository.create.mock
            .calls[0][0] as TenantUserEntity;

        expect(passwordHasher.hash).toHaveBeenCalledWith('senha-segura');
        expect(createdUser.cpf).toBe('52998224725');
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(tenantUserRepository.create).toHaveBeenCalledTimes(1);
        expect(createdTenantUser.tenantId).toBe('tenant-1');
        expect(createdTenantUser.isParliamentarian).toBe(true);
        expect(createdTenantUser.toPrimitives().status).toBe(
            TenantUserStatus.ACTIVE,
        );
        expect(parliamentarianRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ tenantUserId: createdTenantUser.id }),
        );
        expect(result.tenantUserId).toBe('tu-1');
        expect(result.user.email).toBe('joao@camara.local');
    });

    it('bloqueia CPF já cadastrado', async () => {
        const userRepository = buildUserRepositoryMock();
        userRepository.findByCpf.mockResolvedValue(
            UserEntity.restore({
                id: 'user-2',
                firstName: 'Outro',
                lastName: 'Usuario',
                cpf: '52998224725',
                email: 'outro@interno.sigl.local',
                passwordHash: 'hash',
                profilePicture: null,
                createdAt: new Date(),
                createdBy: null,
                modifiedAt: new Date(),
                modifiedBy: null,
                isRemoved: false,
            }),
        );

        const { useCase } = buildUseCase({ userRepository });

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            ParliamentarianCpfAlreadyInUseError,
        );
    });

    it('bloqueia partido removido', async () => {
        const politicalPartyRepository = buildPoliticalPartyRepositoryMock();
        politicalPartyRepository.findAnyById.mockResolvedValue(
            PoliticalPartyEntity.restore({
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
            }),
        );

        const { useCase } = buildUseCase({ politicalPartyRepository });

        await expect(
            useCase.execute('tenant-1', { ...dto, politicalPartyId: 'party-1' }),
        ).rejects.toBeInstanceOf(PoliticalPartyRemovedForParliamentarianError);
    });

    it('bloqueia partido de outro tenant', async () => {
        const politicalPartyRepository = buildPoliticalPartyRepositoryMock();
        politicalPartyRepository.findAnyById.mockResolvedValue(null);

        const { useCase } = buildUseCase({ politicalPartyRepository });

        await expect(
            useCase.execute('tenant-1', { ...dto, politicalPartyId: 'party-2' }),
        ).rejects.toBeInstanceOf(PoliticalPartyNotFoundForParliamentarianError);
    });
});
