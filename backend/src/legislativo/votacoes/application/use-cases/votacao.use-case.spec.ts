import { TipoVotacao } from '@prisma/client';
import { AbrirVotacaoUseCase, ListVotacaoTiposUseCase } from './votacao.use-case';
import { VotacaoJaExisteError } from '../errors/votacao.errors';
import { VoteType } from '../../domain/enums/vote-type.enum';

function buildRepositoryMock() {
    return {
        abrirVotacao: jest.fn(),
        obterVotacao: jest.fn(),
        calcularResultadoVotacao: jest.fn(),
        finalizarVotacao: jest.fn(),
    };
}

const votacaoBase = {
    id: 'votacao-1',
    pautaItemId: 'pauta-1',
    tipoVotacao: TipoVotacao.NOMINAL,
    exigePresenca: true,
    votosSim: 0,
    votosNao: 0,
    abstencoes: 0,
    resultado: null,
    realizadaAt: null,
    createdAt: new Date(),
    votos: [],
};

describe('AbrirVotacaoUseCase', () => {
    it('abre votação vinculada ao item de pauta', async () => {
        const repository = buildRepositoryMock();
        repository.abrirVotacao.mockResolvedValue(votacaoBase);

        const useCase = new AbrirVotacaoUseCase(repository as never);
        const result = await useCase.execute(
            'tenant-1',
            'sessao-1',
            'pauta-1',
            { tipoVotacao: TipoVotacao.NOMINAL },
        );

        expect(result.pautaItemId).toBe('pauta-1');
        expect(result.tipo.value).toBe(TipoVotacao.NOMINAL);
        expect(result.aberta).toBe(true);
    });

    it('mapeia votação duplicada no item', async () => {
        const repository = buildRepositoryMock();
        repository.abrirVotacao.mockRejectedValue(
            new Error('Já existe votação principal para este item de pauta'),
        );

        const useCase = new AbrirVotacaoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'pauta-1', {
                tipoVotacao: TipoVotacao.SECRETA,
            }),
        ).rejects.toBeInstanceOf(VotacaoJaExisteError);
    });
});

describe('ListVotacaoTiposUseCase', () => {
    it('lista tipos de votação', () => {
        const useCase = new ListVotacaoTiposUseCase();
        const result = useCase.execute();

        expect(result.tipos).toHaveLength(3);
        expect(result.tipos.map((tipo) => tipo.value)).toEqual(
            Object.values(VoteType),
        );
    });
});
