import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AbrirSessaoUseCase } from './abrir-sessao.use-case';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SessaoPlenariaEntity } from '../../domain/entities/sessao-plenaria.entity';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';

function makeSessao(statusSessao: StatusSessao): SessaoPlenariaEntity {
    const s = new SessaoPlenariaEntity();
    s.id = 'sessao-1';
    s.tenantId = 'tenant-1';
    s.statusSessao = statusSessao;
    return s;
}

describe('AbrirSessaoUseCase', () => {
    let useCase: AbrirSessaoUseCase;
    let repo: jest.Mocked<SessaoPlenariaRepository>;

    beforeEach(async () => {
        repo = {
            findSessaoById: jest.fn(),
            transicionarStatus: jest.fn(),
            calcularQuorum: jest.fn(),
            publicarPauta: jest.fn(),
            setFase: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<SessaoPlenariaRepository>;

        const module = await Test.createTestingModule({
            providers: [
                AbrirSessaoUseCase,
                { provide: SESSAO_PLENARIA_REPOSITORY, useValue: repo },
            ],
        }).compile();

        useCase = module.get(AbrirSessaoUseCase);
    });

    it('lança NotFoundException quando sessão não existe', async () => {
        repo.findSessaoById.mockResolvedValue(null);
        await expect(useCase.execute('t1', 's1', {}, 'user-1'))
            .rejects.toThrow(NotFoundException);
    });

    it('lança BadRequestException para transição inválida (ENCERRADA → ABERTA)', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.ENCERRADA));
        await expect(useCase.execute('t1', 's1', {}, 'user-1'))
            .rejects.toThrow(BadRequestException);
    });

    it('lança UnprocessableEntityException quando quórum insuficiente', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.AGENDADA));
        repo.calcularQuorum.mockResolvedValue({ quorumMinimo: 5, quorumPresente: 3, temQuorum: false });
        await expect(useCase.execute('t1', 's1', {}, 'user-1'))
            .rejects.toThrow(UnprocessableEntityException);
    });

    it('não chama transicionarStatus quando quórum insuficiente', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.AGENDADA));
        repo.calcularQuorum.mockResolvedValue({ quorumMinimo: 5, quorumPresente: 3, temQuorum: false });
        await expect(useCase.execute('t1', 's1', {}, 'user-1')).rejects.toThrow();
        expect(repo.transicionarStatus).not.toHaveBeenCalled();
    });

    it('chama transicionarStatus com ABERTA quando quórum atingido', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.AGENDADA));
        repo.calcularQuorum.mockResolvedValue({ quorumMinimo: 5, quorumPresente: 7, temQuorum: true });
        repo.transicionarStatus.mockResolvedValue(undefined);

        const result = await useCase.execute('t1', 's1', {}, 'user-1');

        expect(repo.transicionarStatus).toHaveBeenCalledWith('s1', 't1', expect.objectContaining({
            novoStatus: StatusSessao.ABERTA,
            responsavelId: 'user-1',
        }));
        expect(result.statusSessao).toBe(StatusSessao.ABERTA);
    });
});
