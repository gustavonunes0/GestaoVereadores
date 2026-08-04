import { NotFoundException } from '@nestjs/common';
import { GetMateriaByIdUseCase } from './get-materia-by-id.use-case';
import { MatterNotFoundError } from '../errors/matter.errors';

describe('GetMateriaByIdUseCase', () => {
    const tenantId = 'tenant-1';
    const id = 'materia-1';

    function makeUseCase(repository: { findOne: jest.Mock }) {
        return new GetMateriaByIdUseCase(repository as never);
    }

    it('mapeia NotFoundException do repositório para MatterNotFoundError', async () => {
        const repository = {
            findOne: jest
                .fn()
                .mockRejectedValue(new NotFoundException('Matéria não encontrada')),
        };
        const useCase = makeUseCase(repository);

        await expect(useCase.execute(tenantId, id)).rejects.toBeInstanceOf(
            MatterNotFoundError,
        );
    });

    it('propaga erros inesperados em vez de mascarar como 404', async () => {
        const repository = {
            findOne: jest
                .fn()
                .mockRejectedValue(new Error('Prisma include failed')),
        };
        const useCase = makeUseCase(repository);

        await expect(useCase.execute(tenantId, id)).rejects.toThrow(
            'Prisma include failed',
        );
    });

    it('retorna payload HTTP quando a matéria existe', async () => {
        const repository = {
            findOne: jest.fn().mockResolvedValue({
                id,
                tenantId,
                tipoId: 'tipo-1',
                ementa: 'Ementa de teste suficiente',
                numero: null,
                numeroProtocolo: 1,
                anoId: null,
                status: 'DRAFT',
                emTramitacao: false,
                tramitacaoJson: [],
                autorId: null,
                relatorId: null,
                createdAt: new Date('2026-01-01'),
                updatedAt: new Date('2026-01-01'),
                tipo: { id: 'tipo-1', nome: 'Projeto de Lei', sigla: 'PLO' },
                authorParliamentarian: {
                    id: 'parl-1',
                    parliamentaryName: 'Vereador Teste',
                    officeNumber: null,
                    photoUrl: null,
                },
            }),
        };
        const useCase = makeUseCase(repository);
        const result = await useCase.execute(tenantId, id);

        expect(result.id).toBe(id);
        expect(result.status.value).toBe('DRAFT');
        expect(result.autor?.nome).toBe('Vereador Teste');
    });
});
