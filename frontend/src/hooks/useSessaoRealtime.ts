import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { sessoesApi } from '../api/legislative/sessoes.api';
import type { VotacaoAbertaEvent, VotacaoEncerradaEvent, VotacaoPlacarEvent } from '../types/legislative';
import type { FaseSessao, PautaItemDetalhe } from '../types/sessoes';
import { pautaItemRotulo } from '../types/sessoes';

export interface PresencaUpdate {
    parlamentarianUserId: string;
    presente: boolean;
    origem: 'APP' | 'STAFF';
    presentes: number;
    ausentes: number;
    temQuorum: boolean;
}

function normalizeVotacaoAberta(
    data: Partial<VotacaoAbertaEvent> & Record<string, unknown>,
    sessaoId: string,
): VotacaoAbertaEvent | null {
    const eventSessaoId = (data.sessaoId as string | undefined) ?? sessaoId;
    if (eventSessaoId !== sessaoId) return null;

    const votacaoId = (data.votacaoId ?? data.id) as string | undefined;
    const pautaItemId = data.pautaItemId as string | undefined;
    if (!votacaoId || !pautaItemId) return null;

    return {
        sessaoId: eventSessaoId,
        votacaoId,
        pautaItemId,
        tipoVotacao: (data.tipoVotacao as VotacaoAbertaEvent['tipoVotacao']) ?? 'NOMINAL',
        titulo: (data.titulo as string) ?? 'Votação em andamento',
        ementa: data.ementa as string | undefined,
        votosSim: Number(data.votosSim ?? 0),
        votosNao: Number(data.votosNao ?? 0),
        abstencoes: Number(data.abstencoes ?? 0),
        aceitaVotoIndividual: Boolean(data.aceitaVotoIndividual ?? data.tipoVotacao === 'NOMINAL'),
    };
}

export function mapPautaItemVotacaoAberta(
    sessaoId: string,
    item: PautaItemDetalhe,
): VotacaoAbertaEvent | null {
    const votacao = item.votacao;
    if (!votacao || votacao.finalizada || votacao.resultado) return null;

    return {
        sessaoId,
        votacaoId: votacao.id,
        pautaItemId: item.id,
        tipoVotacao: (votacao.tipoVotacao as VotacaoAbertaEvent['tipoVotacao']) ?? 'NOMINAL',
        titulo: pautaItemRotulo(item),
        ementa: item.materia?.ementa,
        votosSim: votacao.votosSim ?? 0,
        votosNao: votacao.votosNao ?? 0,
        abstencoes: votacao.abstencoes ?? 0,
        aceitaVotoIndividual: votacao.tipoVotacao === 'NOMINAL',
    };
}

export function useSessaoRealtime(sessaoId: string) {
    const [faseAtual, setFaseAtual] = useState<FaseSessao | null>(null);
    const [votacaoAberta, setVotacaoAberta] = useState<VotacaoAbertaEvent | null>(null);
    const [placar, setPlacar] = useState<VotacaoPlacarEvent | null>(null);
    const [votacaoEncerrada, setVotacaoEncerrada] = useState<VotacaoEncerradaEvent | null>(null);
    const [wsConectado, setWsConectado] = useState(false);
    const [presencaUpdate, setPresencaUpdate] = useState<PresencaUpdate | null>(null);

    const syncVotacaoFromPauta = useCallback(async () => {
        if (!sessaoId) return;
        try {
            const itens = await sessoesApi.getPauta(sessaoId);
            const itemAberto = (itens ?? []).find(
                (item) => item.votacao && !item.votacao.finalizada && !item.votacao.resultado,
            );
            if (itemAberto) {
                setVotacaoAberta(mapPautaItemVotacaoAberta(sessaoId, itemAberto));
            } else {
                setVotacaoAberta(null);
                setPlacar(null);
            }
        } catch {
            /* mantém estado atual em falha de rede */
        }
    }, [sessaoId]);

    const syncRef = useRef(syncVotacaoFromPauta);
    syncRef.current = syncVotacaoFromPauta;
    const votacaoAbertaRef = useRef(votacaoAberta);
    votacaoAbertaRef.current = votacaoAberta;

    useEffect(() => {
        void syncVotacaoFromPauta();
    }, [syncVotacaoFromPauta]);

    useEffect(() => {
        if (!sessaoId) return;

        const token = localStorage.getItem('access_token');
        const socket = io('/sessao', {
            auth: { token },
            query: { sessaoId },
            transports: ['websocket'],
        });

        const handleVotacaoAberta = (data: Partial<VotacaoAbertaEvent> & Record<string, unknown>) => {
            const normalized = normalizeVotacaoAberta(data, sessaoId);
            if (normalized) {
                setVotacaoAberta(normalized);
                setPlacar(null);
                setVotacaoEncerrada(null);
            }
        };

        socket.on('connect', () => setWsConectado(true));
        socket.on('disconnect', () => setWsConectado(false));
        socket.on('sessao:fase', (data: { faseAtual: FaseSessao }) => setFaseAtual(data.faseAtual));
        socket.on('votacao:aberta', handleVotacaoAberta);
        socket.on('votacao:convocada', handleVotacaoAberta);
        socket.on('votacao:placar', (data: VotacaoPlacarEvent) => setPlacar(data));
        socket.on('votacao:encerrada', (data: VotacaoEncerradaEvent) => {
            setVotacaoEncerrada({
                ...data,
                titulo: votacaoAbertaRef.current?.titulo,
            });
            setVotacaoAberta(null);
            setPlacar(null);
            void syncRef.current();
        });
        socket.on('sessao:encerrada', () => setFaseAtual('ENCERRADA'));
        socket.on('presenca:atualizada', (data: PresencaUpdate) => setPresencaUpdate(data));

        return () => {
            socket.disconnect();
        };
    }, [sessaoId]);

    return {
        faseAtual,
        votacaoAberta,
        votacaoEncerrada,
        placar,
        wsConectado,
        presencaUpdate,
        syncVotacaoFromPauta,
        limparVotacaoEncerrada: () => setVotacaoEncerrada(null),
    };
}
