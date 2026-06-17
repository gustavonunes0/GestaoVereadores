import { UserEntity } from '../../../../identidade/users/domain/user.entity';
import { CreateParliamentarianUseCase } from './create-parliamentarian.use-case';
import {
    ParliamentarianCpfAlreadyInUseError,
    ParliamentarianEmailAlreadyInUseError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
} from '../errors/parliamentarian.errors';
import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
    buildParlamentarianUserRepositoryMock,
    buildPoliticalPartyRepositoryMock,
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
        parlamentarianUserRepository?: ReturnType<typeof buildParlamentarianUserRepositoryMock>;
        politicalPartyRepository?: ReturnType<typeof buildPoliticalPartyRepositoryMock>;
        userRepository?: ReturnType<typeof buildUserRepositoryMock>;
        passwordHasher?: ReturnType<typeof buildPasswordHasherMock>;
    } = {}) {
        const parliamentarianRepository =
            overrides.parliamentarianRepository ??
            buildParliamentarianRepositoryMock();
        const parlamentarianUserRepository =
            overrides.parlamentarianUserRepository ??
            buildParlamentarianUserRepositoryMock();
        const politicalPartyRepository =
            overrides.politicalPartyRepository ??
            buildPoliticalPartyRepositoryMock();
        const userRepository =
            overrides.userRepository ?? buildUserRepositoryMock();
        const passwordHasher =
            overrides.passwordHasher ?? buildPasswordHasherMock();

        const created = buildParliamentarianWithRelations();
        parliamentarianRepository.create.mockResolvedValue(created);
        parliamentarianRepository.findById.mockResolvedValue(created);
        userRepository.create.mockImplementation(async (user: UserEntity) => user);
        parlamentarianUserRepository.create.mockImplementation(
            async (entity) => entity,
        );

        return {
            useCase: new CreateParliamentarianUseCase(
                parliamentarianRepository as never,
                parlamentarianUserRepository as never,
                userRepository as never,
                passwordHasher as never,
                politicalPartyRepository as never,
            ),
            parliamentarianRepository,
            parlamentarianUserRepository,
            userRepository,
            passwordHasher,
            politicalPartyRepository,
        };
    }

    it('cria parlamentar e provisiona ParlamentarianUser com CPF e senha', async () => {
        const { useCase, parlamentarianUserRepository, userRepository, parliamentarianRepository, passwordHasher } =
            buildUseCase();

        const result = await useCase.execute('tenant-1', dto);
        const createdUser = userRepository.create.mock.calls[0][0] as UserEntity;

        expect(passwordHasher.hash).toHaveBeenCalledWith('senha-segura');
        expect(createdUser.cpf).toBe('52998224725');
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(parlamentarianUserRepository.create).toHaveBeenCalledTimes(1);
        expect(parliamentarianRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ parliamentaryName: 'Vereador Teste' }),
        );
        expect(result.hasAccess).toBe(true);
        expect(result.user?.email).toBe('parlamentar.52998224725@interno.sigl.local');
    });

    it('usa e-mail informado no cadastro', async () => {
        const { useCase, userRepository, parliamentarianRepository } = buildUseCase();
        const withEmail = buildParliamentarianWithRelations({
            user: {
                id: 'user-1',
                firstName: 'Vereador',
                lastName: 'Teste',
                email: 'vereador@camara.gov.br',
            },
        });
        parliamentarianRepository.findById.mockResolvedValue(withEmail);

        const result = await useCase.execute('tenant-1', {
            ...dto,
            email: 'vereador@camara.gov.br',
        });
        const createdUser = userRepository.create.mock.calls[0][0] as UserEntity;

        expect(createdUser.email).toBe('vereador@camara.gov.br');
        expect(result.user?.email).toBe('vereador@camara.gov.br');
    });

    it('bloqueia e-mail já cadastrado', async () => {
        const userRepository = buildUserRepositoryMock();
        userRepository.findByEmail.mockResolvedValue(
            UserEntity.restore({
                id: 'user-3',
                firstName: 'Outro',
                lastName: 'Usuario',
                cpf: '11144477735',
                email: 'vereador@camara.gov.br',
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

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                email: 'vereador@camara.gov.br',
            }),
        ).rejects.toBeInstanceOf(ParliamentarianEmailAlreadyInUseError);
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
