import { AddFrenteMembroUseCase } from './add-frente-membro.use-case';
import { RemoveFrenteMembroUseCase } from './remove-frente-membro.use-case';
import {
    FrenteMembroNotFoundError,
    FrenteNotFoundError,
    ParliamentarianAlreadyOnFrontError,
    ParliamentarianNotFoundForFrenteError,
} from '../errors/frente.errors';
import { FrenteViewModel } from '../view-models/frente.view-model';
import { buildParliamentarianWithRelations } from '../../../parlamentares/application/use-cases/__tests__/parliamentarian-test.helpers';
import {
    buildFrontMember,
    buildParliamentaryFrontEntity,
    buildParliamentaryFrontRepositoryMock,
    buildParliamentaryFrontWithRelations,
} from './__tests__/frente-test.helpers';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';

describe('AddFrenteMembroUseCase', () => {
    const dto = { parliamentarianId: 'parl-1' };

    it('adiciona parlamentar da mesma Câmara', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById.mockResolvedValue(buildParliamentaryFrontWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(false);
        repository.addMember.mockResolvedValue(
            buildFrontMember({ parliamentarianId: 'parl-1' }),
        );

        const useCase = new AddFrenteMembroUseCase(
            repository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await useCase.execute('tenant-1', 'front-1', dto);

        expect(repository.addMember).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: 'tenant-1',
                frontId: 'front-1',
                parliamentarianId: 'parl-1',
            }),
        );
    });

    it('permite membros de partidos diferentes na mesma frente', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        const parliamentarianRepository = { findById: jest.fn() };

        const assignments = [
            { parlId: 'parl-1', partyId: 'party-pt', acronym: 'PT' },
            { parlId: 'parl-2', partyId: 'party-psdb', acronym: 'PSDB' },
            { parlId: 'parl-3', partyId: 'party-mdb', acronym: 'MDB' },
        ];

        repository.findById.mockResolvedValue(buildParliamentaryFrontWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(false);
        repository.addMember.mockImplementation(async (data) =>
            buildFrontMember({
                id: `member-${data.parliamentarianId}`,
                parliamentarianId: data.parliamentarianId,
                partyAcronym:
                    assignments.find((a) => a.parlId === data.parliamentarianId)
                        ?.acronym ?? 'XX',
            }),
        );

        const useCase = new AddFrenteMembroUseCase(
            repository as never,
            parliamentarianRepository as never,
        );

        for (const { parlId, partyId, acronym } of assignments) {
            parliamentarianRepository.findById.mockResolvedValueOnce(
                buildParliamentarianWithRelations({
                    entity: buildParliamentarianWithRelations().entity,
                    politicalParty: {
                        id: partyId,
                        name: `Partido ${acronym}`,
                        acronym,
                        flagUrl: null,
                    },
                }),
            );
            await useCase.execute('tenant-1', 'front-1', {
                parliamentarianId: parlId,
            });
        }

        expect(repository.addMember).toHaveBeenCalledTimes(3);
    });

    it('define coordenador ao adicionar membro com setAsCoordinator', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById
            .mockResolvedValueOnce(buildParliamentaryFrontWithRelations())
            .mockResolvedValueOnce(
                buildParliamentaryFrontWithRelations({
                    entity: buildParliamentaryFrontEntity({
                        coordinatorParliamentarianId: 'parl-1',
                    }),
                    coordinator: {
                        id: 'parl-1',
                        parliamentaryName: 'Vereador Teste',
                        officeNumber: '101',
                        politicalParty: {
                            id: 'party-1',
                            name: 'Partido Teste',
                            acronym: 'PT',
                        },
                    },
                    members: [buildFrontMember({ parliamentarianId: 'parl-1' })],
                }),
            );
        repository.existsMemberByParliamentarian.mockResolvedValue(false);
        repository.addMember.mockResolvedValue(
            buildFrontMember({ parliamentarianId: 'parl-1' }),
        );
        repository.update.mockResolvedValue(buildParliamentaryFrontWithRelations());

        const useCase = new AddFrenteMembroUseCase(
            repository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        const result = await useCase.execute('tenant-1', 'front-1', {
            parliamentarianId: 'parl-1',
            setAsCoordinator: true,
        });

        expect(repository.update).toHaveBeenCalledWith('tenant-1', 'front-1', {
            coordinatorParliamentarianId: 'parl-1',
        });
        expect(result.members[0].isCoordinator).toBe(true);
    });

    it('bloqueia parlamentar duplicado na frente', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById.mockResolvedValue(buildParliamentaryFrontWithRelations());
        repository.existsMemberByParliamentarian.mockResolvedValue(true);

        const useCase = new AddFrenteMembroUseCase(
            repository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'front-1', dto),
        ).rejects.toBeInstanceOf(ParliamentarianAlreadyOnFrontError);
    });

    it('bloqueia frente inexistente', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById.mockResolvedValue(null);

        const useCase = new AddFrenteMembroUseCase(
            repository as never,
            { findById: jest.fn() } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'front-1', dto),
        ).rejects.toBeInstanceOf(FrenteNotFoundError);
    });

    it('bloqueia parlamentar inexistente no tenant', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById.mockResolvedValue(buildParliamentaryFrontWithRelations());

        const useCase = new AddFrenteMembroUseCase(
            repository as never,
            { findById: jest.fn().mockResolvedValue(null) } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'front-1', dto),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundForFrenteError);
    });
});

describe('RemoveFrenteMembroUseCase', () => {
    it('remove membro da frente', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById.mockResolvedValue(buildParliamentaryFrontWithRelations());
        repository.removeMember.mockResolvedValue(undefined);

        const useCase = new RemoveFrenteMembroUseCase(repository as never);
        await useCase.execute('tenant-1', 'front-1', 'member-1');

        expect(repository.removeMember).toHaveBeenCalledWith(
            'tenant-1',
            'front-1',
            'member-1',
        );
    });

    it('remove coordenador ao excluir membro coordenador', async () => {
        const member = buildFrontMember({
            id: 'member-1',
            parliamentarianId: 'parl-coord',
        });
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById
            .mockResolvedValueOnce(
                buildParliamentaryFrontWithRelations({
                    entity: buildParliamentaryFrontEntity({
                        coordinatorParliamentarianId: 'parl-coord',
                    }),
                    members: [member],
                }),
            )
            .mockResolvedValueOnce(
                buildParliamentaryFrontWithRelations({ members: [] }),
            );
        repository.removeMember.mockResolvedValue(undefined);
        repository.update.mockResolvedValue(buildParliamentaryFrontWithRelations());

        const useCase = new RemoveFrenteMembroUseCase(repository as never);
        await useCase.execute('tenant-1', 'front-1', 'member-1');

        expect(repository.update).toHaveBeenCalledWith('tenant-1', 'front-1', {
            coordinatorParliamentarianId: null,
        });
    });

    it('bloqueia remoção de membro inexistente', async () => {
        const repository = buildParliamentaryFrontRepositoryMock();
        repository.findById.mockResolvedValue(
            buildParliamentaryFrontWithRelations(),
        );
        repository.removeMember.mockRejectedValue(
            new TenantScopedUpdateError(
                'Membro não encontrado nesta frente parlamentar',
            ),
        );

        const useCase = new RemoveFrenteMembroUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'front-1', 'member-x'),
        ).rejects.toBeInstanceOf(FrenteMembroNotFoundError);
    });
});

describe('FrenteViewModel', () => {
    it('expõe membros suprapartidários com indicação de coordenador', () => {
        const data = buildParliamentaryFrontWithRelations({
            entity: buildParliamentaryFrontEntity({
                coordinatorParliamentarianId: 'parl-1',
            }),
            coordinator: {
                id: 'parl-1',
                parliamentaryName: 'João Silva',
                officeNumber: '01',
                politicalParty: { id: 'p1', name: 'PT', acronym: 'PT' },
            },
            members: [
                buildFrontMember({
                    id: 'm1',
                    parliamentarianId: 'parl-1',
                    partyAcronym: 'PT',
                }),
                buildFrontMember({
                    id: 'm2',
                    parliamentarianId: 'parl-2',
                    partyAcronym: 'PSDB',
                }),
            ],
        });

        const http = FrenteViewModel.toHttp(data);

        expect(http.members).toHaveLength(2);
        expect(http.members[0].isCoordinator).toBe(true);
        expect(http.members[1].isCoordinator).toBe(false);
        expect(http.members[0].parliamentarian.politicalParty?.acronym).toBe(
            'PT',
        );
        expect(http.members[1].parliamentarian.politicalParty?.acronym).toBe(
            'PSDB',
        );
    });
});
