import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EncerrarVotacaoUseCase } from './encerrar-votacao.use-case';
import { VotacaoRepository } from '../../domain/repositories/votacao.repository';
import { VotacaoEntity } from '../../domain/entities/votacao.entity';
import { VOTACAO_REPOSITORY } from '../../votacoes.tokens';
import { PrismaService } from '../../../../prisma/prisma.service';

function makeVotacao(encerrada: boolean): VotacaoEntity {
    const v = new VotacaoEntity();
    v.id = 'vot-1';
    v.pautaItemId = 'pauta-1';
    v.encerradaAt = encerrada ? new Date() : null;
    return v;
}

describe('EncerrarVotacaoUseCase', () => {
    let useCase: EncerrarVotacaoUseCase;
    let repo: jest.Mocked<VotacaoRepository>;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        repo = {
            findVotacaoById: jest.fn(),
            calcularContagem: jest.fn(),
            encerrar: jest.fn(),
        } as unknown as jest.Mocked<VotacaoRepository>;

        prisma = {
            pautaItem: {
                findFirst: jest.fn(),
            },
        } as unknown as jest.Mocked<PrismaService>;

        const module = await Test.createTestingModule({
            providers: [
                EncerrarVotacaoUseCase,
                { provide: VOTACAO_REPOSITORY, useValue: repo },
                { provide: PrismaService, useValue: prisma },
            ],
        }).compile();

        useCase = module.get(EncerrarVotacaoUseCase);
    });

    it('lança NotFoundException quando votação não existe', async () => {
        repo.findVotacaoById.mockResolvedValue(null);
        await expect(useCase.execute('t1', 'v1', {}, 'user-1'))
            .rejects.toThrow(NotFoundException);
    });

    it('lança BadRequestException quando votação já encerrada', async () => {
        repo.findVotacaoById.mockResolvedValue(makeVotacao(true));
        await expect(useCase.execute('t1', 'v1', {}, 'user-1'))
            .rejects.toThrow(BadRequestException);
    });

    it('chama calcularContagem com groupBy antes de encerrar', async () => {
        repo.findVotacaoById.mockResolvedValue(makeVotacao(false));
        (prisma.pautaItem.findFirst as jest.Mock).mockResolvedValue({
            id: 'pauta-1',
            sessao: { tenantId: 't1' },
            materia: { id: 'mat-1', tenantId: 't1' },
        });
        repo.calcularContagem.mockResolvedValue({ votosSim: 5, votosNao: 2, abstencoes: 1 });
        repo.encerrar.mockResolvedValue(undefined);

        const result = await useCase.execute('t1', 'v1', {}, 'user-1');

        expect(repo.calcularContagem).toHaveBeenCalledWith('v1');
        expect(repo.encerrar).toHaveBeenCalledWith('v1', 'pauta-1', 't1', 'mat-1',
            expect.objectContaining({ votosSim: 5, votosNao: 2, resultado: 'APROVADO' }));
        expect(result.resultado).toBe('APROVADO');
    });

    it('determina REJEITADO quando votosNao > votosSim', async () => {
        repo.findVotacaoById.mockResolvedValue(makeVotacao(false));
        (prisma.pautaItem.findFirst as jest.Mock).mockResolvedValue({
            id: 'pauta-1',
            sessao: { tenantId: 't1' },
            materia: { id: 'mat-1', tenantId: 't1' },
        });
        repo.calcularContagem.mockResolvedValue({ votosSim: 2, votosNao: 5, abstencoes: 0 });
        repo.encerrar.mockResolvedValue(undefined);

        const result = await useCase.execute('t1', 'v1', {}, 'user-1');
        expect(result.resultado).toBe('REJEITADO');
    });

    it('lança NotFoundException quando tenant não corresponde ao pautaItem', async () => {
        repo.findVotacaoById.mockResolvedValue(makeVotacao(false));
        (prisma.pautaItem.findFirst as jest.Mock).mockResolvedValue({
            id: 'pauta-1',
            sessao: { tenantId: 'outro-tenant' },
            materia: { id: 'mat-1', tenantId: 'outro-tenant' },
        });

        await expect(useCase.execute('t1', 'v1', {}, 'user-1'))
            .rejects.toThrow(NotFoundException);
    });
});
