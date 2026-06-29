import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isParlamentarianSession, isStaffSession, JwtPayload } from '../../../auth/domain/types/jwt-payload.type';

export type VotacaoAbertaPayload = {
    sessaoId: string;
    votacaoId: string;
    pautaItemId: string;
    tipoVotacao: string;
    titulo: string;
    ementa?: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    aceitaVotoIndividual: boolean;
};

export type VotacaoPlacarPayload = {
    votacaoId: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
};

export type VotacaoEncerradaPayload = {
    votacaoId: string;
    resultado: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    votoQualidade: boolean;
    /** Votos individuais — só em votação NOMINAL; SECRETA nunca expõe */
    votos?: Array<{ parliamentaryName: string; voto: string }>;
};

export type SessaoFasePayload = {
    sessaoId: string;
    faseAtual: string;
};

export type SessaoEncerradaPayload = {
    sessaoId: string;
};

@Injectable()
@WebSocketGateway({ namespace: '/sessao', cors: { origin: '*' } })
export class SessaoRealtimeGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    // mapeamento parliamentarianId → sala individual
    private readonly parlRooms = new Map<string, string>();

    constructor(private readonly jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        const token =
            (client.handshake.auth?.token as string | undefined) ??
            (client.handshake.headers?.authorization as string | undefined)?.replace('Bearer ', '');

        if (!token) {
            client.disconnect();
            return;
        }

        try {
            const payload = this.jwtService.verify<JwtPayload>(token);
            const tenantId =
                isStaffSession(payload) || isParlamentarianSession(payload)
                    ? payload.tenantId
                    : null;

            if (!tenantId) {
                client.disconnect();
                return;
            }

            await client.join(`tenant:${tenantId}`);
            client.data.tenantId = tenantId;

            if (isParlamentarianSession(payload)) {
                const room = `parlamentar:${payload.parliamentarianId}`;
                await client.join(room);
                client.data.parliamentarianId = payload.parliamentarianId;
                this.parlRooms.set(payload.parliamentarianId, room);
            }
        } catch {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        if (client.data.parliamentarianId) {
            this.parlRooms.delete(client.data.parliamentarianId as string);
        }
    }

    emitVotacaoAberta(tenantId: string, payload: VotacaoAbertaPayload) {
        this.server.to(`tenant:${tenantId}`).emit('votacao:aberta', payload);
    }

    /** Convoca parlamentares (app mobile / painel do vereador) a registrarem voto. */
    emitVotacaoConvocada(tenantId: string, payload: VotacaoAbertaPayload) {
        this.server.to(`tenant:${tenantId}`).emit('votacao:convocada', payload);
    }

    emitVotacaoPlacar(tenantId: string, payload: VotacaoPlacarPayload) {
        this.server.to(`tenant:${tenantId}`).emit('votacao:placar', payload);
    }

    emitVotacaoEncerrada(tenantId: string, payload: VotacaoEncerradaPayload) {
        this.server.to(`tenant:${tenantId}`).emit('votacao:encerrada', payload);
    }

    emitSessaoFase(tenantId: string, payload: SessaoFasePayload) {
        this.server.to(`tenant:${tenantId}`).emit('sessao:fase', payload);
    }

    emitSessaoEncerrada(tenantId: string, payload: SessaoEncerradaPayload) {
        this.server.to(`tenant:${tenantId}`).emit('sessao:encerrada', payload);
    }

    emitirPalavraPedida(tenantId: string, payload: { pedidoId: string; parlamentarNome: string; sessaoId: string; criadoEm: Date }) {
        this.server.to(`tenant:${tenantId}`).emit('palavra:pedida', payload);
    }

    emitirPalavraConcedida(tenantId: string, payload: { pedidoId: string; parlamentarNome: string; sessaoId: string }) {
        this.server.to(`tenant:${tenantId}`).emit('palavra:concedida', payload);
    }

    emitirPalavraNegada(parliamentarianId: string, payload: { pedidoId: string; sessaoId: string }) {
        this.server.to(`parlamentar:${parliamentarianId}`).emit('palavra:negada', payload);
    }

    emitirPalavraEncerrada(tenantId: string, payload: { pedidoId: string; parlamentarNome: string; sessaoId: string }) {
        this.server.to(`tenant:${tenantId}`).emit('palavra:encerrada', payload);
    }
}
