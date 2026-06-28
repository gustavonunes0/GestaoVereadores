import { FasePauta } from '@prisma/client';
import { AddPautaItemUseCase, ListPautaFasesUseCase } from './pauta.use-case';
import {
    PautaMateriaDuplicadaError,
    PautaOrdemEmUsoError,
} from '../errors/pauta.errors';
import { AgendaPhase } from '../../domain/enums/agenda-phase.enum';

function buildRepositoryMock() {
    return {
        listPautaItens: jest.fn(),
        getPautaItemById: jest.fn(),
        addPautaItem: jest.fn(),
        updatePautaItem: jest.fn(),
        removerPautaItem: jest.fn(),
    };
}

const pautaItemBase = {
    id: 'pauta-1',
    sessaoId: 'sessao-1',
    materiaId: 'materia-1',
    ordem: 1,
    fase: FasePauta.ORDEM_DO_DIA,
    resultado: null,
    isRemoved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    materia: {
        id: 'materia-1',
        ementa: 'Teste',
        numero: 1,
        status: 'EM_PAUTA',
        tipo: { id: 't1', nome: 'PL' },
        ano: { id: 'a1', valor: 2026 },
    },
    votacao: null,
};

describe('AddPautaItemUseCase', () => {
    it('adiciona matéria à pauta com view-model', async () => {
        const repository = buildRepositoryMock();
        repository.addPautaItem.mockResolvedValue({
            ...pautaItemBase,
            fase: FasePauta.PEQUENO_EXPEDIENTE,
        });

        const useCase = new AddPautaItemUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'sessao-1', {
            materiaId: 'materia-1',
            ordem: 1,
            fase: FasePauta.PEQUENO_EXPEDIENTE,
        });

        expect(result.fase.value).toBe(FasePauta.PEQUENO_EXPEDIENTE);
        expect(result.materia?.id).toBe('materia-1');
        expect(result.podeVotar).toBe(true);
    });

    it('mapeia matéria duplicada', async () => {
        const repository = buildRepositoryMock();
        repository.addPautaItem.mockRejectedValue(
            new Error('Matéria já consta na pauta desta sessão'),
        );

        const useCase = new AddPautaItemUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', {
                materiaId: 'materia-1',
                ordem: 1,
            }),
        ).rejects.toBeInstanceOf(PautaMateriaDuplicadaError);
    });

    it('mapeia ordem em uso', async () => {
        const repository = buildRepositoryMock();
        repository.addPautaItem.mockRejectedValue(
            new Error('Ordem 2 já está em uso na pauta desta sessão'),
        );

        const useCase = new AddPautaItemUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', {
                materiaId: 'materia-2',
                ordem: 2,
            }),
        ).rejects.toBeInstanceOf(PautaOrdemEmUsoError);
    });
});

describe('ListPautaFasesUseCase', () => {
    it('lista quatro fases sugeridas', () => {
        const useCase = new ListPautaFasesUseCase();
        const result = useCase.execute();

        expect(result.fases).toHaveLength(4);
        expect(result.fases.map((f) => f.value)).toContain(
            AgendaPhase.PEQUENO_EXPEDIENTE,
        );
        expect(result.fases.map((f) => f.value)).toContain(
            AgendaPhase.ORDEM_DO_DIA,
        );
    });
});
