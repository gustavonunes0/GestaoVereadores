import { CodigoSituacaoSessao } from '@prisma/client';
import { SessionLifecycleAction } from '../../domain/enums/session-lifecycle-action.enum';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import { CreateSessaoPlenariaUseCase } from './create-sessao-plenaria.use-case';
import {
    ExecuteSessionLifecycleUseCase,
    ListSessionLifecycleActionsUseCase,
} from './session-lifecycle.use-case';
import {
    SessaoInvalidDateRangeError,
    SessaoLifecycleActionNotAllowedError,
    SessaoPlenariaNotFoundError,
} from '../errors/sessao.errors';

function buildRepositoryMock() {
    return {
        create: jest.fn(),
        findOne: jest.fn(),
        executarCicloVida: jest.fn(),
    };
}

const sessaoBase = {
    id: 'sessao-1',
    tenantId: 'tenant-1',
    dataInicio: new Date('2026-06-01T19:00:00'),
    dataFim: null,
    mensagem: null,
    cicloVidaJson: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tipoSessao: {
        id: 'tipo-1',
        nome: 'Ordinária',
        codigo: 'ORDINARIA',
        requerQuorum: true,
    },
    situacao: {
        id: 'sit-1',
        nome: 'Agendada',
        codigo: CodigoSituacaoSessao.AGENDADA,
    },
};

describe('CreateSessaoPlenariaUseCase', () => {
    it('cadastra sessão com situação AGENDADA', async () => {
        const repository = buildRepositoryMock();
        repository.create.mockResolvedValue(sessaoBase);

        const useCase = new CreateSessaoPlenariaUseCase(repository as never);
        const result = await useCase.execute('tenant-1', {
            dataInicio: '2026-06-01T19:00:00',
            tipoSessaoId: 'tipo-1',
        });

        expect(result.situacao.codigo).toBe(CodigoSituacaoSessao.AGENDADA);
        expect(result.workflow.capabilities.canStart).toBe(true);
    });

    it('bloqueia data fim anterior à data início', async () => {
        const useCase = new CreateSessaoPlenariaUseCase(
            buildRepositoryMock() as never,
        );

        await expect(
            useCase.execute('tenant-1', {
                dataInicio: '2026-06-02T19:00:00',
                dataFim: '2026-06-01T19:00:00',
                tipoSessaoId: 'tipo-1',
            }),
        ).rejects.toBeInstanceOf(SessaoInvalidDateRangeError);
    });
});

describe('ExecuteSessionLifecycleUseCase', () => {
    it('inicia sessão agendada', async () => {
        const repository = buildRepositoryMock();
        repository.findOne.mockResolvedValue(sessaoBase);
        repository.executarCicloVida.mockResolvedValue({
            ...sessaoBase,
            situacao: {
                ...sessaoBase.situacao,
                codigo: CodigoSituacaoSessao.EM_ANDAMENTO,
                nome: 'Em andamento',
            },
        });

        const useCase = new ExecuteSessionLifecycleUseCase(
            repository as never,
        );
        const result = await useCase.execute('tenant-1', 'sessao-1', {
            action: SessionLifecycleAction.INICIAR,
        });

        expect(repository.executarCicloVida).toHaveBeenCalled();
        expect(result.situacao.codigo).toBe(CodigoSituacaoSessao.EM_ANDAMENTO);
    });

    it('bloqueia encerrar sessão ainda agendada', async () => {
        const repository = buildRepositoryMock();
        repository.findOne.mockResolvedValue(sessaoBase);

        const useCase = new ExecuteSessionLifecycleUseCase(
            repository as never,
        );

        await expect(
            useCase.execute('tenant-1', 'sessao-1', {
                action: SessionLifecycleAction.ENCERRAR,
            }),
        ).rejects.toBeInstanceOf(SessaoLifecycleActionNotAllowedError);
    });

    it('bloqueia sessão inexistente', async () => {
        const repository = buildRepositoryMock();
        repository.findOne.mockRejectedValue(new Error('not found'));

        const useCase = new ExecuteSessionLifecycleUseCase(
            repository as never,
        );

        await expect(
            useCase.execute('tenant-1', 'sessao-x', {
                action: SessionLifecycleAction.INICIAR,
            }),
        ).rejects.toBeInstanceOf(SessaoPlenariaNotFoundError);
    });
});

describe('ListSessionLifecycleActionsUseCase', () => {
    it('lista INICIAR e CANCELAR para AGENDADA', async () => {
        const repository = buildRepositoryMock();
        repository.findOne.mockResolvedValue(sessaoBase);

        const useCase = new ListSessionLifecycleActionsUseCase(
            repository as never,
        );
        const result = await useCase.execute('tenant-1', 'sessao-1');

        expect(result.status?.value).toBe(SessionStatus.AGENDADA);
        expect(result.actions.map((a) => a.action)).toContain(
            SessionLifecycleAction.INICIAR,
        );
    });
});

describe('ListSessionStatusesUseCase', () => {
    it('lista status e transições', async () => {
        const { ListSessionStatusesUseCase } = await import(
            './session-lifecycle.use-case'
        );
        const useCase = new ListSessionStatusesUseCase();
        const result = useCase.execute();

        expect(result.statuses.length).toBe(4);
        expect(result.transitions.length).toBeGreaterThan(0);
    });
});
