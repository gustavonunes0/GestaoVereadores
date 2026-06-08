import { Voto } from '@prisma/client';
import { RegistrarVotoUseCase } from './voto.use-case';
import { VotoDuplicadoError, VotoMandatoInativoError } from '../errors/voto.errors';

function buildRepositoryMock() {
    return {
        listVotos: jest.fn(),
        getVotoById: jest.fn(),
        registrarVoto: jest.fn(),
        updateVoto: jest.fn(),
    };
}

const votoBase = {
    id: 'voto-1',
    votacaoId: 'votacao-1',
    parlamentarId: 'parlamentar-1',
    voto: Voto.SIM,
    parlamentar: {
        id: 'parlamentar-1',
        ativo: true,
        pessoa: { nome: 'Vereador Teste', nomeParlamentar: null },
    },
};

describe('RegistrarVotoUseCase', () => {
    it('registra voto com view-model', async () => {
        const repository = buildRepositoryMock();
        repository.registrarVoto.mockResolvedValue(votoBase);

        const useCase = new RegistrarVotoUseCase(repository as never);
        const result = await useCase.execute(
            'tenant-1',
            'sessao-1',
            'pauta-1',
            {
                parlamentarId: 'parlamentar-1',
                voto: Voto.SIM,
            },
        );

        expect(result.voto.value).toBe(Voto.SIM);
        expect(result.parlamentar?.nome).toBe('Vereador Teste');
    });

    it('mapeia voto duplicado', async () => {
        const repository = buildRepositoryMock();
        repository.registrarVoto.mockRejectedValue(
            new Error('Parlamentar já registrou voto nesta votação'),
        );

        const useCase = new RegistrarVotoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'pauta-1', {
                parlamentarId: 'parlamentar-1',
                voto: Voto.NAO,
            }),
        ).rejects.toBeInstanceOf(VotoDuplicadoError);
    });

    it('mapeia mandato inativo', async () => {
        const repository = buildRepositoryMock();
        repository.registrarVoto.mockRejectedValue(
            new Error(
                'Parlamentar não possui mandato ativo na legislatura da sessão',
            ),
        );

        const useCase = new RegistrarVotoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'pauta-1', {
                parlamentarId: 'parlamentar-1',
                voto: Voto.ABSTENCAO,
            }),
        ).rejects.toBeInstanceOf(VotoMandatoInativoError);
    });
});
