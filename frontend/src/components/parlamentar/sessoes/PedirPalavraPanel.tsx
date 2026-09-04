import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import {
    sessoesApi,
    type PedidoPalavraHttp,
    type PedidoPalavraStatus,
} from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import type { PedidoPalavraUpdate } from '../../../hooks/useSessaoRealtime';
import type { StatusSessao } from '../../../types/sessoes';

interface Props {
    sessaoId: string;
    statusSessao: StatusSessao;
    hasConfirmed: boolean;
    pedidoUpdate: PedidoPalavraUpdate | null;
}

const STATUS_LABEL: Record<PedidoPalavraStatus, string> = {
    AGUARDANDO: 'Aguardando a mesa',
    CONCEDIDO: 'Palavra concedida',
    NEGADO: 'Pedido negado',
    ENCERRADO: 'Uso da palavra encerrado',
};

function hintDisabled(statusSessao: StatusSessao, hasConfirmed: boolean): string | null {
    if (statusSessao !== 'ABERTA') {
        if (statusSessao === 'AGENDADA') {
            return 'Disponível quando a sessão for aberta.';
        }
        return 'Pedido de palavra só é permitido com a sessão aberta.';
    }
    if (!hasConfirmed) {
        return 'Confirme sua presença para pedir a palavra.';
    }
    return null;
}

export function PedirPalavraPanel({
    sessaoId,
    statusSessao,
    hasConfirmed,
    pedidoUpdate,
}: Props) {
    const { showToast } = useAppToast();
    const [tema, setTema] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [pedido, setPedido] = useState<PedidoPalavraHttp | null>(null);
    const pedidoRef = useRef(pedido);
    pedidoRef.current = pedido;

    const bloqueio = hintDisabled(statusSessao, hasConfirmed);
    const ativo =
        pedido &&
        (pedido.status === 'AGUARDANDO' || pedido.status === 'CONCEDIDO');

    useEffect(() => {
        if (!pedidoUpdate) return;
        if (pedidoUpdate.sessaoId && pedidoUpdate.sessaoId !== sessaoId) return;
        if (pedidoUpdate.status === 'AGUARDANDO') return;

        const atual = pedidoRef.current;
        if (!atual) return;
        if (atual.id !== 'local' && atual.id !== pedidoUpdate.pedidoId) return;

        setPedido({
            ...atual,
            id: pedidoUpdate.pedidoId,
            status: pedidoUpdate.status,
        });

        if (pedidoUpdate.status === 'CONCEDIDO') {
            showToast('success', 'Palavra concedida', 'A mesa concedeu o uso da palavra.');
        } else if (pedidoUpdate.status === 'NEGADO') {
            showToast('warn', 'Pedido negado', 'A mesa não concedeu a palavra.');
        } else if (pedidoUpdate.status === 'ENCERRADO') {
            showToast('info', 'Palavra encerrada', 'O uso da palavra foi encerrado.');
        }
    }, [pedidoUpdate, sessaoId, showToast]);

    const pedir = async () => {
        if (bloqueio || ativo) return;
        setEnviando(true);
        try {
            const criado = await sessoesApi.pedirPalavra(
                sessaoId,
                tema.trim() ? { tema: tema.trim() } : undefined,
            );
            setPedido(criado);
            setTema('');
            showToast('success', 'Pedido enviado', 'Aguarde a resposta da mesa.');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Não foi possível pedir a palavra.';
            if (/já tem um pedido/i.test(msg)) {
                setPedido({
                    id: 'local',
                    sessaoId,
                    parlamentarNome: '',
                    status: 'AGUARDANDO',
                    criadoEm: new Date().toISOString(),
                    respondidoEm: null,
                    encerradoEm: null,
                    duracaoSegundos: null,
                    tema: null,
                    fase: null,
                    tempoConcedidoSegundos: null,
                });
            }
            showToast('error', 'Pedido de palavra', msg);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="parl-sessao-panel">
            <h3 className="parl-sessao-panel__title">Pedir a palavra</h3>
            <p className="parl-sessao-panel__hint">
                Solicite o uso da palavra à mesa diretora durante a sessão.
            </p>

            {bloqueio ? (
                <p className="parl-sessao-palavra-disabled">{bloqueio}</p>
            ) : ativo && pedido ? (
                <div
                    className={`parl-sessao-palavra-status parl-sessao-palavra-status--${pedido.status.toLowerCase()}`}
                >
                    <i
                        className={
                            pedido.status === 'CONCEDIDO'
                                ? 'pi pi-microphone'
                                : 'pi pi-hourglass'
                        }
                        aria-hidden
                    />
                    <div>
                        <strong>{STATUS_LABEL[pedido.status]}</strong>
                        {pedido.tema ? <p className="m-0 mt-1 text-sm">{pedido.tema}</p> : null}
                    </div>
                </div>
            ) : (
                <>
                    {pedido &&
                    (pedido.status === 'NEGADO' || pedido.status === 'ENCERRADO') ? (
                        <p className="parl-sessao-palavra-disabled mb-2">
                            {STATUS_LABEL[pedido.status]}. Você pode solicitar novamente.
                        </p>
                    ) : null}
                    <div className="flex flex-column gap-2">
                        <InputText
                            value={tema}
                            onChange={(e) => setTema(e.target.value)}
                            placeholder="Tema (opcional)"
                            maxLength={200}
                        />
                        <Button
                            className="parl-sessao-presenca-cta"
                            label="Pedir a palavra"
                            icon="pi pi-microphone"
                            loading={enviando}
                            onClick={() => void pedir()}
                        />
                    </div>
                </>
            )}
        </section>
    );
}
