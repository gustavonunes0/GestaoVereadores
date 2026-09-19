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
    /** Total de votos individuais registrados (sim+não+abst). */
    totalRegistrados?: number;
    /** IDs dos parlamentares que já votaram — sem revelar a opção. */
    parliamentarianIdsQueVotaram?: string[];
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

export type SessaoCanceladaPayload = {
    sessaoId: string;
};

export type SessaoSuspensaPayload = {
    sessaoId: string;
};

export type SessaoAbertaPayload = {
    sessaoId: string;
};

export type PresencaAtualizadaPayload = {
    sessaoId: string;
    parliamentarianId: string;
    /** @deprecated use parliamentarianId */
    parlamentarianUserId: string;
    presente: boolean;
    situacao?: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
    origem: 'APP' | 'STAFF';
    presentes: number;
    ausentes: number;
    temQuorum: boolean;
};

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function resolveSessaoId(value: unknown): string | null {
    if (typeof value === 'string' && UUID_RE.test(value)) return value;
    if (Array.isArray(value) && typeof value[0] === 'string' && UUID_RE.test(value[0])) {
        return value[0];
    }
    return null;
}

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
        const painelSessaoId = resolveSessaoId(client.handshake.query?.sessaoId);

        if (!token) {
            // Telão público: só entra na sala do painel (leitura).
            if (painelSessaoId) {
                await client.join(`painel:${painelSessaoId}`);
                client.data.painelSessaoId = painelSessaoId;
                return;
            }
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

            if (painelSessaoId) {
                await client.join(`painel:${painelSessaoId}`);
                client.data.painelSessaoId = painelSessaoId;
            }

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

    private emitTenantAndPainel(
        tenantId: string,
        event: string,
        payload: { sessaoId?: string },
        sessaoIdFallback?: string,
    ) {
        this.server.to(`tenant:${tenantId}`).emit(event, payload);
        const sessaoId = payload.sessaoId ?? sessaoIdFallback;
        if (sessaoId) {
            this.server.to(`painel:${sessaoId}`).emit(event, payload);
        }
    }

    emitVotacaoAberta(tenantId: string, payload: VotacaoAbertaPayload) {
        this.emitTenantAndPainel(tenantId, 'votacao:aberta', payload);
    }

    /** Convoca parlamentares (app mobile / painel do vereador) a registrarem voto. */
    emitVotacaoConvocada(tenantId: string, payload: VotacaoAbertaPayload) {
        this.emitTenantAndPainel(tenantId, 'votacao:convocada', payload);
    }

    emitVotacaoPlacar(
        tenantId: string,
        payload: VotacaoPlacarPayload,
        sessaoId?: string,
    ) {
        this.server.to(`tenant:${tenantId}`).emit('votacao:placar', payload);
        if (sessaoId) {
            this.server.to(`painel:${sessaoId}`).emit('votacao:placar', payload);
        }
    }

    emitVotacaoEncerrada(
        tenantId: string,
        payload: VotacaoEncerradaPayload,
        sessaoId?: string,
    ) {
        this.server.to(`tenant:${tenantId}`).emit('votacao:encerrada', payload);
        if (sessaoId) {
            this.server.to(`painel:${sessaoId}`).emit('votacao:encerrada', payload);
        }
    }

    emitSessaoFase(tenantId: string, payload: SessaoFasePayload) {
        this.emitTenantAndPainel(tenantId, 'sessao:fase', payload);
    }

    emitSessaoEncerrada(tenantId: string, payload: SessaoEncerradaPayload) {
        this.emitTenantAndPainel(tenantId, 'sessao:encerrada', payload);
    }

    emitSessaoCancelada(tenantId: string, payload: SessaoCanceladaPayload) {
        this.emitTenantAndPainel(tenantId, 'sessao:cancelada', payload);
    }

    emitSessaoSuspensa(tenantId: string, payload: SessaoSuspensaPayload) {
        this.emitTenantAndPainel(tenantId, 'sessao:suspensa', payload);
    }

    emitSessaoAberta(tenantId: string, payload: SessaoAbertaPayload) {
        this.emitTenantAndPainel(tenantId, 'sessao:aberta', payload);
    }

    emitPresencaAtualizada(tenantId: string, payload: PresencaAtualizadaPayload) {
        this.emitTenantAndPainel(tenantId, 'presenca:atualizada', payload);
    }

    emitirPalavraPedida(tenantId: string, payload: { pedidoId: string; parlamentarNome: string; sessaoId: string; criadoEm: Date }) {
        this.emitTenantAndPainel(tenantId, 'palavra:pedida', payload);
    }

    emitirPalavraConcedida(tenantId: string, payload: { pedidoId: string; parlamentarNome: string; sessaoId: string }) {
        this.emitTenantAndPainel(tenantId, 'palavra:concedida', payload);
    }

    emitirPalavraNegada(parliamentarianId: string, payload: { pedidoId: string; sessaoId: string }) {
        this.server.to(`parlamentar:${parliamentarianId}`).emit('palavra:negada', payload);
    }

    emitirPalavraEncerrada(tenantId: string, payload: { pedidoId: string; parlamentarNome: string; sessaoId: string }) {
        this.emitTenantAndPainel(tenantId, 'palavra:encerrada', payload);
    }
}
