import { ResultadoVotacao, TipoVotacao } from '@prisma/client';
import { PreviewResultadoVotacaoUseCase } from './resultado.use-case';
import { ResultadoManualNaoPermitidoError } from '../errors/resultado.errors';

function buildRepositoryMock() {
    return {
        calcularResultadoVotacao: jest.fn(),
        finalizarVotacao: jest.fn(),
    };
}

describe('PreviewResultadoVotacaoUseCase', () => {
    it('retorna preview calculado automaticamente', async () => {
        const repository = buildRepositoryMock();
        repository.calcularResultadoVotacao.mockResolvedValue({
            votosSim: 6,
            votosNao: 4,
            abstencoes: 1,
            resultado: ResultadoVotacao.APROVADO,
            resultadoPauta: 'APROVADO',
            calculadoAutomaticamente: true,
            atualizaPauta: true,
            atualizaMateria: true,
        });

        const useCase = new PreviewResultadoVotacaoUseCase(repository as never);
        const result = await useCase.execute(
            'tenant-1',
            'sessao-1',
            'pauta-1',
        );

        expect(result.preview).toBe(true);
        expect(result.calculadoAutomaticamente).toBe(true);
        expect(result.resultado.value).toBe(ResultadoVotacao.APROVADO);
    });

    it('mapeia bloqueio de totais manuais', async () => {
        const repository = buildRepositoryMock();
        repository.calcularResultadoVotacao.mockRejectedValue(
            new Error(
                'Votação nominal ou secreta calcula totais automaticamente',
            ),
        );

        const useCase = new PreviewResultadoVotacaoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'pauta-1', {
                votosSim: 10,
                votosNao: 5,
            }),
        ).rejects.toBeInstanceOf(ResultadoManualNaoPermitidoError);
    });
});
