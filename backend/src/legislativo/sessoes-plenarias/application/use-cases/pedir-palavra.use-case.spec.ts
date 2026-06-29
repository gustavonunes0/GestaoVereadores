import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { PedirPalavraUseCase } from './pedir-palavra.use-case';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { ParlamentarianJwtPayload } from '../../../../auth/domain/types/jwt-payload.type';
import { SessaoPlenariaEntity } from '../../domain/entities/sessao-plenaria.entity';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { PedidoPalavraEntity } from '../../domain/entities/pedido-palavra.entity';

const user: ParlamentarianJwtPayload = {
    sessionType: 'parliamentarian',
    sub: 'user-1',
    tenantId: 'tenant-1',
    parliamentarianUserId: 'pu-1',
    parliamentarianId: 'parl-1',
    parliamentaryName: 'Vereador Teste',
};

function makeSessao(status: StatusSessao): SessaoPlenariaEntity {
    const s = new SessaoPlenariaEntity();
    s.id = 'sessao-1';
    s.tenantId = 'tenant-1';
    s.statusSessao = status;
    return s;
}

function makePedido(): PedidoPalavraEntity {
    const p = new PedidoPalavraEntity();
    p.id = 'pedido-1';
    p.sessaoId = 'sessao-1';
    p.parliamentarianId = 'parl-1';
    p.status = 'AGUARDANDO';
    p.criadoEm = new Date();
    return p;
}

describe('PedirPalavraUseCase', () => {
    let useCase: PedirPalavraUseCase;
    let sessaoRepo: jest.Mocked<SessaoPlenariaRepository>;
    let pedidoRepo: jest.Mocked<PedidoPalavraRepository>;
    let prisma: { presencaSessao: { findFirst: jest.Mock } };
    let gateway: jest.Mocked<SessaoRealtimeGateway>;

    beforeEach(() => {
        sessaoRepo = { findSessaoById: jest.fn() } as unknown as jest.Mocked<SessaoPlenariaRepository>;
        pedidoRepo = {
            create: jest.fn(),
            findAtivo: jest.fn(),
        } as unknown as jest.Mocked<PedidoPalavraRepository>;
        prisma = { presencaSessao: { findFirst: jest.fn() } };
        gateway = { emitirPalavraPedida: jest.fn() } as unknown as jest.Mocked<SessaoRealtimeGateway>;

        useCase = new PedirPalavraUseCase(sessaoRepo, pedidoRepo, prisma as any, gateway);
    });

    it('Sessão não ABERTA → 422 em PT-BR', async () => {
        sessaoRepo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.AGENDADA));
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow(UnprocessableEntityException);
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow('Pedido de palavra só é permitido em sessão aberta');
    });

    it('Sessão não encontrada → 422 em PT-BR', async () => {
        sessaoRepo.findSessaoById.mockResolvedValue(null);
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow(UnprocessableEntityException);
    });

    it('Parlamentar não PRESENTE → 422 em PT-BR', async () => {
        sessaoRepo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.ABERTA));
        prisma.presencaSessao.findFirst.mockResolvedValue({ presente: false, situacao: 'AUSENTE' });
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow(UnprocessableEntityException);
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow('Você precisa estar marcado como presente');
    });

    it('Parlamentar sem presença → 422 em PT-BR', async () => {
        sessaoRepo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.ABERTA));
        prisma.presencaSessao.findFirst.mockResolvedValue(null);
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow(UnprocessableEntityException);
    });

    it('Pedido ativo existente → 409 em PT-BR', async () => {
        sessaoRepo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.ABERTA));
        prisma.presencaSessao.findFirst.mockResolvedValue({ presente: true, situacao: 'PRESENTE' });
        pedidoRepo.findAtivo.mockResolvedValue(makePedido());
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow(ConflictException);
        await expect(useCase.execute('sessao-1', user)).rejects.toThrow('Você já tem um pedido de palavra em andamento');
    });

    it('Criação bem-sucedida → emite palavra:pedida', async () => {
        sessaoRepo.findSessaoById.mockResolvedValue(makeSessao(StatusSessao.ABERTA));
        prisma.presencaSessao.findFirst.mockResolvedValue({ presente: true, situacao: 'PRESENTE' });
        pedidoRepo.findAtivo.mockResolvedValue(null);
        const pedido = makePedido();
        pedidoRepo.create.mockResolvedValue(pedido);

        const result = await useCase.execute('sessao-1', user);

        expect(result.status).toBe('AGUARDANDO');
        expect(gateway.emitirPalavraPedida).toHaveBeenCalledWith('tenant-1', expect.objectContaining({
            pedidoId: 'pedido-1',
            parlamentarNome: 'Vereador Teste',
            sessaoId: 'sessao-1',
        }));
    });
});
