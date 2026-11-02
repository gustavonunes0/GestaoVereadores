import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SetPautaItemAtualUseCase } from './set-pauta-item-atual.use-case';
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

describe('SetPautaItemAtualUseCase', () => {
    let useCase: SetPautaItemAtualUseCase;
    let repo: jest.Mocked<SessaoPlenariaRepository>;

    beforeEach(async () => {
        repo = {
            findSessaoById: jest.fn(),
            setPautaItemAtual: jest.fn().mockResolvedValue({
                pautaItemAtualId: 'item-1',
            }),
        } as unknown as jest.Mocked<SessaoPlenariaRepository>;

        const module = await Test.createTestingModule({
            providers: [
                SetPautaItemAtualUseCase,
                { provide: SESSAO_PLENARIA_REPOSITORY, useValue: repo },
            ],
        }).compile();

        useCase = module.get(SetPautaItemAtualUseCase);
    });

    it('lança NotFoundException quando sessão não existe', async () => {
        repo.findSessaoById.mockResolvedValue(null);
        await expect(
            useCase.execute('t1', 's1', { pautaItemId: 'item-1' }),
        ).rejects.toThrow(NotFoundException);
    });

    it('bloqueia persistência com sessão AGENDADA (canal local cobre preview)', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.AGENDADA));
        await expect(
            useCase.execute('t1', 's1', { pautaItemId: 'item-1' }),
        ).rejects.toThrow(BadRequestException);
    });

    it('permite com sessão ABERTA', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.ABERTA));
        await expect(
            useCase.execute('t1', 's1', { pautaItemId: 'item-1' }),
        ).resolves.toEqual({ pautaItemAtualId: 'item-1' });
        expect(repo.setPautaItemAtual).toHaveBeenCalledWith(
            's1',
            't1',
            'item-1',
        );
    });

    it('permite com sessão SUSPENSA', async () => {
        repo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.SUSPENSA));
        await expect(
            useCase.execute('t1', 's1', { pautaItemId: 'item-1' }),
        ).resolves.toEqual({ pautaItemAtualId: 'item-1' });
    });
});
