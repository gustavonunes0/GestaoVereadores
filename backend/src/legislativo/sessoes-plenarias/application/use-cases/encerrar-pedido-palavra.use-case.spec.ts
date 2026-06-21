import { ConflictException } from '@nestjs/common';
import { EncerrarPedidoPalavraUseCase } from './encerrar-pedido-palavra.use-case';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { PedidoPalavraEntity } from '../../domain/entities/pedido-palavra.entity';

function makePedido(status: 'AGUARDANDO' | 'CONCEDIDO' | 'NEGADO' | 'ENCERRADO', respondidoEm?: Date): PedidoPalavraEntity {
    const p = new PedidoPalavraEntity();
    p.id = 'pedido-1';
    p.sessaoId = 'sessao-1';
    p.parliamentarianId = 'parl-1';
    p.status = status;
    p.criadoEm = new Date('2026-01-01T10:00:00Z');
    if (respondidoEm) p.respondidoEm = respondidoEm;
    return p;
}

describe('EncerrarPedidoPalavraUseCase', () => {
    let useCase: EncerrarPedidoPalavraUseCase;
    let pedidoRepo: jest.Mocked<PedidoPalavraRepository>;
    let prisma: { parliamentarian: { findUnique: jest.Mock } };
    let gateway: jest.Mocked<SessaoRealtimeGateway>;

    beforeEach(() => {
        pedidoRepo = {
            findById: jest.fn(),
            updateStatus: jest.fn(),
        } as unknown as jest.Mocked<PedidoPalavraRepository>;
        prisma = { parliamentarian: { findUnique: jest.fn().mockResolvedValue({ parliamentaryName: 'Vereador Teste' }) } };
        gateway = { emitirPalavraEncerrada: jest.fn() } as unknown as jest.Mocked<SessaoRealtimeGateway>;

        useCase = new EncerrarPedidoPalavraUseCase(pedidoRepo, prisma as any, gateway);
    });

    it('Pedido não CONCEDIDO → 409 em PT-BR', async () => {
        pedidoRepo.findById.mockResolvedValue(makePedido('AGUARDANDO'));
        await expect(useCase.execute('pedido-1', 'tenant-1')).rejects.toThrow(ConflictException);
        await expect(useCase.execute('pedido-1', 'tenant-1')).rejects.toThrow('Pedido não está com a palavra concedida');
        expect(pedidoRepo.findById).toHaveBeenCalledWith('pedido-1', 'tenant-1');
    });

    it('Pedido não encontrado → 409 em PT-BR', async () => {
        pedidoRepo.findById.mockResolvedValue(null);
        await expect(useCase.execute('pedido-1', 'tenant-1')).rejects.toThrow(ConflictException);
    });

    it('Encerrar → duracaoSegundos calculado e emite palavra:encerrada', async () => {
        const respondidoEm = new Date('2026-01-01T10:00:00Z');
        const pedido = makePedido('CONCEDIDO', respondidoEm);
        pedidoRepo.findById.mockResolvedValue(pedido);

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-01-01T10:02:30Z')); // 150 segundos depois

        const atualizado = { ...pedido, status: 'ENCERRADO' as const, encerradoEm: new Date(), duracaoSegundos: 150 };
        pedidoRepo.updateStatus.mockResolvedValue(atualizado as any);

        await useCase.execute('pedido-1', 'tenant-1');

        const [, , dados] = pedidoRepo.updateStatus.mock.calls[0];
        expect(dados?.duracaoSegundos).toBe(150);
        expect(gateway.emitirPalavraEncerrada).toHaveBeenCalledWith('tenant-1', expect.objectContaining({
            pedidoId: 'pedido-1',
            sessaoId: 'sessao-1',
        }));

        jest.useRealTimers();
    });
});
