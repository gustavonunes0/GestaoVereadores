import { StatusMateria } from '@prisma/client';
import { MatterTramitationAction } from '../../domain/enums/matter-tramitation-action.enum';
import { CreateMateriaUseCase } from './create-materia.use-case';
import { ExecuteMatterTramitationUseCase } from './execute-matter-tramitation.use-case';
import {
    MatterEmentaRequiredError,
    MatterNotFoundError,
    MatterTramitationActionNotAllowedError,
} from '../errors/matter.errors';

function buildMateriaRepositoryMock() {
    return {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        alterarStatus: jest.fn(),
        tramitarMateria: jest.fn(),
        remove: jest.fn(),
        listarAutores: jest.fn(),
        adicionarAutor: jest.fn(),
        removerAutor: jest.fn(),
    };
}

const materiaBase = {
    id: 'matter-1',
    tenantId: 'tenant-1',
    tipoId: 'tipo-1',
    ementa: 'Dispõe sobre educação municipal.',
    numero: 1,
    anoId: 'ano-1',
    status: StatusMateria.EM_TRAMITACAO,
    emTramitacao: true,
    tramitacaoJson: [],
    autorId: null,
    relatorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tipo: { id: 'tipo-1', nome: 'Projeto de Lei' },
    ano: { id: 'ano-1', valor: 2026 },
};

describe('ExecuteMatterTramitationUseCase', () => {
    it('tramita matéria para APROVADA com histórico', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.findOne.mockResolvedValue(materiaBase);
        repository.tramitarMateria.mockResolvedValue({
            ...materiaBase,
            status: StatusMateria.APROVADA,
            emTramitacao: false,
            tramitacaoJson: [
                {
                    status: StatusMateria.APROVADA,
                    observacao: 'Aprovada em plenário',
                    em: '2026-05-28T12:00:00.000Z',
                },
            ],
        });

        const useCase = new ExecuteMatterTramitationUseCase(
            repository as never,
        );
        const result = await useCase.execute('tenant-1', 'matter-1', {
            action: MatterTramitationAction.APROVAR,
            observacao: 'Aprovada em plenário',
        });

        expect(repository.tramitarMateria).toHaveBeenCalled();
        expect(result.status.value).toBe(StatusMateria.APROVADA);
        expect(result.workflow.capabilities.canGenerateNorm).toBe(true);
    });

    it('bloqueia ação inválida ARQUIVADA → APROVAR', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.findOne.mockResolvedValue({
            ...materiaBase,
            status: StatusMateria.ARQUIVADA,
        });

        const useCase = new ExecuteMatterTramitationUseCase(
            repository as never,
        );

        await expect(
            useCase.execute('tenant-1', 'matter-1', {
                action: MatterTramitationAction.APROVAR,
            }),
        ).rejects.toBeInstanceOf(MatterTramitationActionNotAllowedError);
    });

    it('bloqueia matéria inexistente', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.findOne.mockRejectedValue(new Error('not found'));

        const useCase = new ExecuteMatterTramitationUseCase(
            repository as never,
        );

        await expect(
            useCase.execute('tenant-1', 'matter-x', {
                action: MatterTramitationAction.APROVAR,
            }),
        ).rejects.toBeInstanceOf(MatterNotFoundError);
    });
});

describe('CreateMateriaUseCase', () => {
    const dto = {
        tipoId: 'tipo-1',
        ementa: 'Institui programa municipal de saúde.',
    };

    it('cadastra proposição em DRAFT', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.create.mockResolvedValue({
            ...materiaBase,
            status: StatusMateria.DRAFT,
            emTramitacao: false,
        });

        const useCase = new CreateMateriaUseCase(repository as never);
        const result = await useCase.execute('tenant-1', dto);

        expect(result.status.value).toBe(StatusMateria.DRAFT);
        expect(result.workflow.capabilities.canTramitate).toBe(false);
        expect(repository.create).toHaveBeenCalledWith(
            'tenant-1',
            expect.objectContaining({
                status: StatusMateria.DRAFT,
            }),
        );
    });

    it('bloqueia ementa vazia', async () => {
        const useCase = new CreateMateriaUseCase(
            buildMateriaRepositoryMock() as never,
        );

        await expect(
            useCase.execute('tenant-1', { ...dto, ementa: '  ' }),
        ).rejects.toBeInstanceOf(MatterEmentaRequiredError);
    });
});

describe('ListMatterStatusesUseCase', () => {
    it('lista status e transições do fluxo', async () => {
        const { ListMatterStatusesUseCase } = await import(
            './list-matter-statuses.use-case'
        );
        const useCase = new ListMatterStatusesUseCase();
        const result = useCase.execute();

        expect(result.statuses.length).toBeGreaterThan(0);
        expect(result.transitions.length).toBeGreaterThan(0);
    });
});

describe('MatterViewModel', () => {
    it('expõe autor, coautor, relator e workflow', async () => {
        const { MatterViewModel } = await import(
            '../view-models/matter.view-model'
        );

        const http = MatterViewModel.toHttp({
            ...materiaBase,
            autor: { id: 'autor-1', nome: 'Executivo' },
            relator: {
                id: 'parl-1',
                pessoa: { nomeParlamentar: 'Relator Teste' },
            },
            coautores: [
                {
                    parlamentar: {
                        id: 'parl-2',
                        pessoa: { nomeParlamentar: 'Coautor' },
                    },
                },
            ],
            pautaItens: [{}],
            normas: [],
        });

        expect(http.autor?.nome).toBe('Executivo');
        expect(http.relator?.nome).toBe('Relator Teste');
        expect(http.coautores).toHaveLength(1);
        expect(http.workflow.capabilities.canEnterAgenda).toBe(true);
    });
});
