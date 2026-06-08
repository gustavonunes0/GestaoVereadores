import { LegislatureEntity } from '../../../legislaturas/domain/entities/legislature.entity';
import { CreateMesaDiretoraUseCase } from './create-mesa-diretora.use-case';
import { MesaDiretoraInvalidDateRangeError } from '../errors/mesa-diretora.errors';
import {
    buildBoardRepositoryMock,
    buildBoardWithRelations,
} from './__tests__/mesa-diretora-test.helpers';

describe('CreateMesaDiretoraUseCase', () => {
    const dto = {
        name: 'Mesa 2025-2026',
        legislatureId: 'leg-1',
        startDate: '2025-01-01',
        endDate: '2026-12-31',
    };

    it('cria mesa com período de 2 anos', async () => {
        const boardRepository = buildBoardRepositoryMock();
        const legislatureRepository = { findById: jest.fn() };
        legislatureRepository.findById.mockResolvedValue(
            LegislatureEntity.restore({
                id: 'leg-1',
                tenantId: 'tenant-1',
                number: 20,
                startDate: new Date('2025-01-01'),
                endDate: null,
                isCurrent: true,
                isRemoved: false,
                removedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        );
        boardRepository.create.mockResolvedValue(buildBoardWithRelations());

        const useCase = new CreateMesaDiretoraUseCase(
            boardRepository as never,
            legislatureRepository as never,
        );

        const result = await useCase.execute('tenant-1', dto);
        expect(result.name).toBe('Mesa 2025-2026');
    });

    it('aceita período de 1 ano', async () => {
        const boardRepository = buildBoardRepositoryMock();
        const legislatureRepository = {
            findById: jest.fn().mockResolvedValue(
                LegislatureEntity.restore({
                    id: 'leg-1',
                    tenantId: 'tenant-1',
                    number: 20,
                    startDate: new Date('2025-01-01'),
                    endDate: null,
                    isCurrent: true,
                    isRemoved: false,
                    removedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            ),
        };
        boardRepository.create.mockResolvedValue(buildBoardWithRelations());

        const useCase = new CreateMesaDiretoraUseCase(
            boardRepository as never,
            legislatureRepository as never,
        );

        await useCase.execute('tenant-1', {
            ...dto,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
        });

        expect(boardRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
            }),
        );
    });

    it('aceita período de 4 anos', async () => {
        const boardRepository = buildBoardRepositoryMock();
        const legislatureRepository = {
            findById: jest.fn().mockResolvedValue(
                LegislatureEntity.restore({
                    id: 'leg-1',
                    tenantId: 'tenant-1',
                    number: 20,
                    startDate: new Date('2025-01-01'),
                    endDate: null,
                    isCurrent: true,
                    isRemoved: false,
                    removedAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            ),
        };
        boardRepository.create.mockResolvedValue(buildBoardWithRelations());

        const useCase = new CreateMesaDiretoraUseCase(
            boardRepository as never,
            legislatureRepository as never,
        );

        await useCase.execute('tenant-1', {
            ...dto,
            endDate: '2028-12-31',
        });

        expect(boardRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                endDate: new Date('2028-12-31'),
            }),
        );
    });

    it('bloqueia data fim inválida', async () => {
        const useCase = new CreateMesaDiretoraUseCase(
            buildBoardRepositoryMock() as never,
            {
                findById: jest.fn().mockResolvedValue(
                    LegislatureEntity.restore({
                        id: 'leg-1',
                        tenantId: 'tenant-1',
                        number: 20,
                        startDate: new Date('2025-01-01'),
                        endDate: null,
                        isCurrent: true,
                        isRemoved: false,
                        removedAt: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }),
                ),
            } as never,
        );

        await expect(
            useCase.execute('tenant-1', {
                ...dto,
                startDate: '2026-01-01',
                endDate: '2025-01-01',
            }),
        ).rejects.toBeInstanceOf(MesaDiretoraInvalidDateRangeError);
    });
});
