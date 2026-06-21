import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { FaseSessao } from '../types/sessoes';

interface VotacaoAberta {
    id: string;
    titulo: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
}

interface Placar {
    votosSim: number;
    votosNao: number;
    abstencoes: number;
}

export function useSessaoRealtime(sessaoId: string) {
    const [faseAtual, setFaseAtual] = useState<FaseSessao | null>(null);
    const [votacaoAberta, setVotacaoAberta] = useState<VotacaoAberta | null>(null);
    const [placar, setPlacar] = useState<Placar | null>(null);
    const [wsConectado, setWsConectado] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const socket = io('/sessao', {
            auth: { token },
            query: { sessaoId },
            transports: ['websocket'],
        });

        socket.on('connect',           () => setWsConectado(true));
        socket.on('disconnect',        () => setWsConectado(false));
        socket.on('sessao:fase',       (data: { faseAtual: FaseSessao }) => setFaseAtual(data.faseAtual));
        socket.on('votacao:aberta',    (data: VotacaoAberta) => { setVotacaoAberta(data); setPlacar(null); });
        socket.on('votacao:placar',    (data: Placar) => setPlacar(data));
        socket.on('votacao:encerrada', () => { setVotacaoAberta(null); setPlacar(null); });
        socket.on('sessao:encerrada',  () => setFaseAtual('ENCERRADA'));

        return () => { socket.disconnect(); };
    }, [sessaoId]);

    return { faseAtual, votacaoAberta, placar, wsConectado };
}
