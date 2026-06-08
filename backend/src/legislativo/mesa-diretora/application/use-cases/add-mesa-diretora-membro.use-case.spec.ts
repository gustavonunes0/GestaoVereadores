import { BoardRoleEntity } from '../../domain/entities/board-role.entity';
import { DEFAULT_BOARD_ROLE_NAMES } from '../../domain/constants/default-board-roles.constants';
import { AddMesaDiretoraMembroUseCase } from './add-mesa-diretora-membro.use-case';
import { CreateCargoMesaUseCase } from './create-cargo-mesa.use-case';
import { ListCargosMesaUseCase } from './list-cargos-mesa.use-case';
import { RemoveMesaDiretoraMembroUseCase } from './remove-mesa-diretora-membro.use-case';
import {
    BoardRoleAlreadyOccupiedError,
    BoardRoleNameAlreadyInUseError,
    BoardRoleNotFoundForMesaDiretoraError,
    MesaDiretoraMembroNotFoundError,
    MesaDiretoraNotFoundError,
    ParliamentarianAlreadyOnBoardError,
    ParliamentarianNotFoundForMesaDiretoraError,
} from '../errors/mesa-diretora.errors';
import { buildParliamentarianWithRelations } from '../../../parlamentares/application/use-cases/__tests__/parliamentarian-test.helpers';
import {
    buildBoardRepositoryMock,
    buildBoardWithRelations,
} from './__tests__/mesa-diretora-test.helpers';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';

function buildRole(name: string, id: string) {
    return BoardRoleEntity.restore({
        id,
        tenantId: 'tenant-1',
        name,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
}

describe('AddMesaDiretoraMembroUseCase', () => {
    const dto = {
        parliamentarianId: 'parl-1',
        boardRoleId: 'role-presidente',
    };

    it('registra presidente, vice e secretários na mesma mesa', async () => {
        const boardRepository = buildBoardRepositoryMock();
        const parliamentarianRepository = { findById: jest.fn() };

        const assignments = [
            { parlId: 'parl-1', roleId: 'role-presidente', roleName: 'Presidente' },
            { parlId: 'parl-2', roleId: 'role-vice', roleName: 'Vice-Presidente' },
            {
                parlId: 'parl-3',
                roleId: 'role-1-secretario',
                roleName: 'Primeiro Secretário',
            },
            {
                parlId: 'parl-4',
                roleId: 'role-2-secretario',
                roleName: 'Segundo Secretário',
            },
        ];

        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.existsMemberByRole.mockResolvedValue(false);
        boardRepository.existsMemberByParliamentarian.mockResolvedValue(false);
        boardRepository.addMember.mockImplementation(async (data) => ({
            id: `member-${data.parliamentarianId}`,
            parliamentarian: {
                id: data.parliamentarianId,
                parliamentaryName: `Parlamentar ${data.parliamentarianId}`,
                officeNumber: null,
            },
            boardRole: {
                id: data.boardRoleId,
                name:
                    assignments.find((a) => a.roleId === data.boardRoleId)
                        ?.roleName ?? 'Cargo',
            },
            createdAt: new Date(),
        }));

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            parliamentarianRepository as never,
        );

        for (const { parlId, roleId, roleName } of assignments) {
            parliamentarianRepository.findById.mockResolvedValueOnce(
                buildParliamentarianWithRelations(),
            );
            boardRepository.findRoleById.mockResolvedValueOnce(
                buildRole(roleName, roleId),
            );

            await useCase.execute('tenant-1', 'board-1', {
                parliamentarianId: parlId,
                boardRoleId: roleId,
            });
        }

        expect(boardRepository.addMember).toHaveBeenCalledTimes(4);
    });

    it('vincula membro via parliamentarianId (nunca User/TenantUser)', async () => {
        const boardRepository = buildBoardRepositoryMock();
        const parliamentarianRepository = { findById: jest.fn() };

        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.findRoleById.mockResolvedValue(
            buildRole('Presidente', 'role-presidente'),
        );
        boardRepository.existsMemberByRole.mockResolvedValue(false);
        boardRepository.existsMemberByParliamentarian.mockResolvedValue(false);
        boardRepository.addMember.mockResolvedValue({
            id: 'member-1',
            parliamentarian: {
                id: 'parl-1',
                parliamentaryName: 'Vereador Teste',
                officeNumber: '101',
            },
            boardRole: { id: 'role-presidente', name: 'Presidente' },
            createdAt: new Date(),
        });
        parliamentarianRepository.findById.mockResolvedValue(
            buildParliamentarianWithRelations(),
        );

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            parliamentarianRepository as never,
        );

        await useCase.execute('tenant-1', 'board-1', dto);

        expect(parliamentarianRepository.findById).toHaveBeenCalledWith(
            'tenant-1',
            'parl-1',
        );
        expect(boardRepository.addMember).toHaveBeenCalledWith(
            expect.objectContaining({
                parliamentarianId: 'parl-1',
                boardRoleId: 'role-presidente',
            }),
        );
    });

    it('bloqueia cargo já ocupado na mesma mesa', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.findRoleById.mockResolvedValue(
            buildRole('Presidente', 'role-presidente'),
        );
        boardRepository.existsMemberByRole.mockResolvedValue(true);

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'board-1', dto),
        ).rejects.toBeInstanceOf(BoardRoleAlreadyOccupiedError);
    });

    it('bloqueia parlamentar com segundo cargo na mesma mesa', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.findRoleById.mockResolvedValue(
            buildRole('Vice-Presidente', 'role-vice'),
        );
        boardRepository.existsMemberByRole.mockResolvedValue(false);
        boardRepository.existsMemberByParliamentarian.mockResolvedValue(true);

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'board-1', {
                ...dto,
                boardRoleId: 'role-vice',
            }),
        ).rejects.toBeInstanceOf(ParliamentarianAlreadyOnBoardError);
    });

    it('bloqueia mesa inexistente', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(null);

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            { findById: jest.fn() } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'board-1', dto),
        ).rejects.toBeInstanceOf(MesaDiretoraNotFoundError);
    });

    it('bloqueia parlamentar inexistente', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            { findById: jest.fn().mockResolvedValue(null) } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'board-1', dto),
        ).rejects.toBeInstanceOf(ParliamentarianNotFoundForMesaDiretoraError);
    });

    it('bloqueia cargo inexistente', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.findRoleById.mockResolvedValue(null);

        const useCase = new AddMesaDiretoraMembroUseCase(
            boardRepository as never,
            {
                findById: jest
                    .fn()
                    .mockResolvedValue(buildParliamentarianWithRelations()),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', 'board-1', dto),
        ).rejects.toBeInstanceOf(BoardRoleNotFoundForMesaDiretoraError);
    });
});

describe('CreateCargoMesaUseCase', () => {
    it('cria cargo customizado no tenant', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.existsRoleByName.mockResolvedValue(false);
        boardRepository.createRole.mockResolvedValue(
            buildRole('Procurador', 'role-proc'),
        );

        const useCase = new CreateCargoMesaUseCase(boardRepository as never);
        const result = await useCase.execute('tenant-1', {
            name: 'Procurador',
        });

        expect(result.name).toBe('Procurador');
    });

    it('bloqueia nome de cargo duplicado', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.existsRoleByName.mockResolvedValue(true);

        const useCase = new CreateCargoMesaUseCase(boardRepository as never);

        await expect(
            useCase.execute('tenant-1', { name: 'Presidente' }),
        ).rejects.toBeInstanceOf(BoardRoleNameAlreadyInUseError);
    });
});

describe('ListCargosMesaUseCase', () => {
    it('garante cargos padrão antes de listar', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.ensureDefaultRoles.mockResolvedValue(undefined);
        boardRepository.findRoles.mockResolvedValue(
            DEFAULT_BOARD_ROLE_NAMES.map((name, index) =>
                buildRole(name, `role-${index}`),
            ),
        );

        const useCase = new ListCargosMesaUseCase(boardRepository as never);
        const result = await useCase.execute('tenant-1');

        expect(boardRepository.ensureDefaultRoles).toHaveBeenCalledWith(
            'tenant-1',
        );
        expect(result.map((r) => r.name)).toEqual([
            ...DEFAULT_BOARD_ROLE_NAMES,
        ]);
    });
});

describe('RemoveMesaDiretoraMembroUseCase', () => {
    it('remove membro da mesa', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.removeMember.mockResolvedValue(undefined);

        const useCase = new RemoveMesaDiretoraMembroUseCase(
            boardRepository as never,
        );

        await useCase.execute('tenant-1', 'board-1', 'member-1');

        expect(boardRepository.removeMember).toHaveBeenCalledWith(
            'tenant-1',
            'board-1',
            'member-1',
        );
    });

    it('bloqueia remoção de membro inexistente', async () => {
        const boardRepository = buildBoardRepositoryMock();
        boardRepository.findById.mockResolvedValue(buildBoardWithRelations());
        boardRepository.removeMember.mockRejectedValue(
            new TenantScopedUpdateError(
                'Membro não encontrado nesta mesa diretora',
            ),
        );

        const useCase = new RemoveMesaDiretoraMembroUseCase(
            boardRepository as never,
        );

        await expect(
            useCase.execute('tenant-1', 'board-1', 'member-x'),
        ).rejects.toBeInstanceOf(MesaDiretoraMembroNotFoundError);
    });
});
