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
    parlamentarId: null,
    parliamentarianId: 'parliamentarian-1',
    voto: Voto.SIM,
    parliamentarian: {
        id: 'parliamentarian-1',
        parliamentaryName: 'Vereador Teste',
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
                parliamentarianId: 'parliamentarian-1',
                voto: Voto.SIM,
            },
        );

        expect(result.voto.value).toBe(Voto.SIM);
        expect(result.parliamentarian?.nome).toBe('Vereador Teste');
    });

    it('mapeia voto duplicado', async () => {
        const repository = buildRepositoryMock();
        repository.registrarVoto.mockRejectedValue(
            new Error('Parlamentar já registrou voto nesta votação'),
        );

        const useCase = new RegistrarVotoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'pauta-1', {
                parliamentarianId: 'parliamentarian-1',
                voto: Voto.NAO,
            }),
        ).rejects.toBeInstanceOf(VotoDuplicadoError);
    });

    it('mapeia mandato inativo', async () => {
        const repository = buildRepositoryMock();
        repository.registrarVoto.mockRejectedValue(
            new Error('Parlamentar não possui mandato ativo'),
        );

        const useCase = new RegistrarVotoUseCase(repository as never);

        await expect(
            useCase.execute('tenant-1', 'sessao-1', 'pauta-1', {
                parliamentarianId: 'parliamentarian-1',
                voto: Voto.ABSTENCAO,
            }),
        ).rejects.toBeInstanceOf(VotoMandatoInativoError);
    });
});
