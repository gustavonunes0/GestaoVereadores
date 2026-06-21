import { ConflictException } from '@nestjs/common';
import { ResponderPedidoPalavraUseCase } from './responder-pedido-palavra.use-case';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { PedidoPalavraEntity } from '../../domain/entities/pedido-palavra.entity';

function makePedido(status: 'AGUARDANDO' | 'CONCEDIDO' | 'NEGADO' | 'ENCERRADO'): PedidoPalavraEntity {
    const p = new PedidoPalavraEntity();
    p.id = 'pedido-1';
    p.sessaoId = 'sessao-1';
    p.parliamentarianId = 'parl-1';
    p.status = status;
    p.criadoEm = new Date();
    return p;
}

describe('ResponderPedidoPalavraUseCase', () => {
    let useCase: ResponderPedidoPalavraUseCase;
    let pedidoRepo: jest.Mocked<PedidoPalavraRepository>;
    let prisma: { parliamentarian: { findUnique: jest.Mock } };
    let gateway: jest.Mocked<SessaoRealtimeGateway>;

    beforeEach(() => {
        pedidoRepo = {
            findById: jest.fn(),
            updateStatus: jest.fn(),
        } as unknown as jest.Mocked<PedidoPalavraRepository>;
        prisma = { parliamentarian: { findUnique: jest.fn().mockResolvedValue({ parliamentaryName: 'Vereador Teste' }) } };
        gateway = {
            emitirPalavraConcedida: jest.fn(),
            emitirPalavraNegada: jest.fn(),
        } as unknown as jest.Mocked<SessaoRealtimeGateway>;

        useCase = new ResponderPedidoPalavraUseCase(pedidoRepo, prisma as any, gateway);
    });

    it('Pedido não AGUARDANDO → 409 em PT-BR', async () => {
        pedidoRepo.findById.mockResolvedValue(makePedido('CONCEDIDO'));
        await expect(useCase.execute('pedido-1', 'CONCEDIDO', 'tenant-1')).rejects.toThrow(ConflictException);
        await expect(useCase.execute('pedido-1', 'CONCEDIDO', 'tenant-1')).rejects.toThrow('Pedido não está aguardando resposta');
        expect(pedidoRepo.findById).toHaveBeenCalledWith('pedido-1', 'tenant-1');
    });

    it('Pedido não encontrado → 409 em PT-BR', async () => {
        pedidoRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('pedido-1', 'CONCEDIDO', 'tenant-1')).rejects.toThrow(ConflictException);
    });

    it('Conceder → emite palavra:concedida para todos', async () => {
        const pedido = makePedido('AGUARDANDO');
        pedidoRepo.findById.mockResolvedValue(pedido);
        pedidoRepo.updateStatus.mockResolvedValue({ ...pedido, status: 'CONCEDIDO' } as any);

        await useCase.execute('pedido-1', 'CONCEDIDO', 'tenant-1');

        expect(gateway.emitirPalavraConcedida).toHaveBeenCalledWith('tenant-1', expect.objectContaining({
            pedidoId: 'pedido-1',
            sessaoId: 'sessao-1',
        }));
        expect(gateway.emitirPalavraNegada).not.toHaveBeenCalled();
    });

    it('Negar → emite palavra:negada apenas para o parlamentar', async () => {
        const pedido = makePedido('AGUARDANDO');
        pedidoRepo.findById.mockResolvedValue(pedido);
        pedidoRepo.updateStatus.mockResolvedValue({ ...pedido, status: 'NEGADO' } as any);

        await useCase.execute('pedido-1', 'NEGADO', 'tenant-1');

        expect(gateway.emitirPalavraNegada).toHaveBeenCalledWith('parl-1', expect.objectContaining({
            pedidoId: 'pedido-1',
            sessaoId: 'sessao-1',
        }));
        expect(gateway.emitirPalavraConcedida).not.toHaveBeenCalled();
    });
});
