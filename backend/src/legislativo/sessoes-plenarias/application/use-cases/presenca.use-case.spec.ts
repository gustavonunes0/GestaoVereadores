import { SituacaoPresenca } from '@prisma/client';
import {
    ListPresencaSituacoesUseCase,
    RegistrarPresencaUseCase,
    UpdatePresencaUseCase,
} from './presenca.use-case';
import {
    PresencaDuplicadaError,
    PresencaJustificativaObrigatoriaError,
    PresencaMandatoInativoError,
} from '../errors/presenca.errors';
import { AttendanceStatus } from '../../domain/enums/attendance-status.enum';

function buildRepositoryMock() {
    return {
        listPresencas: jest.fn(),
        getPresencaById: jest.fn(),
        registrarPresenca: jest.fn(),
        updatePresenca: jest.fn(),
    };
}

const presencaBase = {
    id: 'presenca-1',
    sessaoId: 'sessao-1',
    parlamentarId: 'parlamentar-1',
    presente: true,
    situacao: SituacaoPresenca.PRESENTE,
    justificativa: null,
    createdAt: new Date(),
    parlamentar: {
        id: 'parlamentar-1',
        ativo: true,
        pessoa: { nome: 'Vereador Teste', nomeParlamentar: null },
    },
};

describe('RegistrarPresencaUseCase', () => {
    it('registra presença com view-model', async () => {
        const repository = buildRepositoryMock();
        repository.registrarPresenca.mockResolvedValue(presencaBase);

        const useCase = new RegistrarPresencaUseCase(repository as never);
        const result = await useCase.execute('tenant-1', 'sessao-1', {
            parlamentarId: 'parlamentar-1',
        });

        expect(result.situacao.value).toBe(SituacaoPresenca.PRESENTE);
        expect(result.parlamentar?.nome).toBe('Vereador Teste');
        expect(result.contaParaQuorum).toBe(true);
    });

    it('mapeia presença duplicada', async () => {
        const repository = buildRepositoryMock();
        repository.registrarPresenca.mockRejectedValue(
            new Error(
                'Parlamentar já possui registro de presença nesta sessão',
            ),
        );

        const useCase = new RegistrarPresencaUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', {
                parlamentarId: 'parlamentar-1',
            }),
        ).rejects.toBeInstanceOf(PresencaDuplicadaError);
    });

    it('mapeia mandato inativo', async () => {
        const repository = buildRepositoryMock();
        repository.registrarPresenca.mockRejectedValue(
            new Error(
                'Parlamentar não possui mandato ativo na legislatura da sessão',
            ),
        );

        const useCase = new RegistrarPresencaUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', {
                parlamentarId: 'parlamentar-1',
            }),
        ).rejects.toBeInstanceOf(PresencaMandatoInativoError);
    });
});

describe('UpdatePresencaUseCase', () => {
    it('atualiza situação justificada', async () => {
        const repository = buildRepositoryMock();
        repository.updatePresenca.mockResolvedValue({
            ...presencaBase,
            presente: false,
            situacao: SituacaoPresenca.JUSTIFICADO,
            justificativa: 'Missão oficial',
        });

        const useCase = new UpdatePresencaUseCase(repository as never);
        const result = await useCase.execute(
            'tenant-1',
            'sessao-1',
            'presenca-1',
            {
                situacao: SituacaoPresenca.JUSTIFICADO,
                justificativa: 'Missão oficial',
            },
        );

        expect(result.situacao.value).toBe(SituacaoPresenca.JUSTIFICADO);
        expect(result.contaParaQuorum).toBe(false);
    });

    it('mapeia justificativa obrigatória', async () => {
        const repository = buildRepositoryMock();
        repository.updatePresenca.mockRejectedValue(
            new Error('Justificativa é obrigatória para presença JUSTIFICADA'),
        );

        const useCase = new UpdatePresencaUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'presenca-1', {
                situacao: SituacaoPresenca.JUSTIFICADO,
            }),
        ).rejects.toBeInstanceOf(PresencaJustificativaObrigatoriaError);
    });
});

describe('ListPresencaSituacoesUseCase', () => {
    it('lista situações de presença', () => {
        const useCase = new ListPresencaSituacoesUseCase();
        const result = useCase.execute();

        expect(result.situacoes).toHaveLength(3);
        expect(result.situacoes.map((s) => s.value)).toEqual(
            Object.values(AttendanceStatus),
        );
    });
});
