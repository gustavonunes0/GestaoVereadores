import { StatusMateria } from '@prisma/client';
import { MatterTramitationAction } from '../../domain/enums/matter-tramitation-action.enum';
import { ExecuteMatterTramitationUseCase } from './execute-matter-tramitation.use-case';
import { ListMatterTramitationActionsUseCase } from './list-matter-tramitation-actions.use-case';
import {
    MatterNotFoundError,
    MatterTramitationActionNotAllowedError,
} from '../errors/matter.errors';

function buildMateriaRepositoryMock() {
    return {
        findOne: jest.fn(),
        tramitarMateria: jest.fn(),
    };
}

const materiaEmTramitacao = {
    id: 'matter-1',
    tenantId: 'tenant-1',
    status: StatusMateria.EM_TRAMITACAO,
    emTramitacao: true,
    tramitacaoJson: [],
    ementa: 'Teste',
    tipoId: 'tipo-1',
};

describe('ExecuteMatterTramitationUseCase', () => {
    it('executa ação APROVAR e retorna matéria atualizada', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.findOne.mockResolvedValue(materiaEmTramitacao);
        repository.tramitarMateria.mockResolvedValue({
            ...materiaEmTramitacao,
            status: StatusMateria.APROVADA,
            emTramitacao: false,
            tipo: { id: 'tipo-1', nome: 'PL' },
            ano: null,
        });

        const useCase = new ExecuteMatterTramitationUseCase(
            repository as never,
        );
        const result = await useCase.execute('tenant-1', 'matter-1', {
            action: MatterTramitationAction.APROVAR,
            observacao: 'Aprovada em plenário',
        });

        expect(repository.tramitarMateria).toHaveBeenCalledWith(
            'tenant-1',
            'matter-1',
            expect.objectContaining({
                action: MatterTramitationAction.APROVAR,
            }),
        );
        expect(result.status.value).toBe(StatusMateria.APROVADA);
    });

    it('bloqueia ação não permitida no status atual', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.findOne.mockResolvedValue({
            ...materiaEmTramitacao,
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
                action: MatterTramitationAction.PROTOCOLAR,
            }),
        ).rejects.toBeInstanceOf(MatterNotFoundError);
    });
});

describe('ListMatterTramitationActionsUseCase', () => {
    it('lista ações disponíveis para EM_TRAMITACAO', async () => {
        const repository = buildMateriaRepositoryMock();
        repository.findOne.mockResolvedValue(materiaEmTramitacao);

        const useCase = new ListMatterTramitationActionsUseCase(
            repository as never,
        );
        const result = await useCase.execute('tenant-1', 'matter-1');

        expect(result.status.value).toBe(StatusMateria.EM_TRAMITACAO);
        expect(result.actions.map((a) => a.action)).toContain(
            MatterTramitationAction.COLOCAR_EM_PAUTA,
        );
        expect(result.actions.map((a) => a.action)).toContain(
            MatterTramitationAction.APROVAR,
        );
    });
});
