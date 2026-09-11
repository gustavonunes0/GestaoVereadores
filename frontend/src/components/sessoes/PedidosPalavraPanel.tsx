import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    sessoesApi,
    type PedidoPalavraHttp,
} from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import type { PedidoPalavraUpdate } from '../../hooks/useSessaoRealtime';
import type { StatusSessao } from '../../types/sessoes';

interface Props {
    sessaoId: string;
    statusSessao: StatusSessao;
    pedidoUpdate: PedidoPalavraUpdate | null;
    /** Destaca o painel no app do parlamentar (Presidente). */
    variant?: 'staff' | 'presidente';
}

export function PedidosPalavraPanel({
    sessaoId,
    statusSessao,
    pedidoUpdate,
    variant = 'staff',
}: Props) {
    const { showToast } = useAppToast();
    const [pedidos, setPedidos] = useState<PedidoPalavraHttp[]>([]);
    const [loading, setLoading] = useState(true);
    const [actingId, setActingId] = useState<string | null>(null);

    const carregar = useCallback(async () => {
        try {
            const lista = await sessoesApi.listPedidosPalavra(sessaoId);
            setPedidos(lista ?? []);
        } catch {
            setPedidos([]);
        } finally {
            setLoading(false);
        }
    }, [sessaoId]);

    useEffect(() => {
        setLoading(true);
        void carregar();
    }, [carregar]);

    useEffect(() => {
        if (!pedidoUpdate) return;
        if (pedidoUpdate.sessaoId && pedidoUpdate.sessaoId !== sessaoId) return;
        if (pedidoUpdate.status === 'AGUARDANDO') {
            showToast(
                'info',
                'Pedido de palavra',
                `${pedidoUpdate.parlamentarNome || 'Um parlamentar'} pediu a palavra.`,
            );
        }
        void carregar();
    }, [pedidoUpdate, sessaoId, carregar, showToast]);

    const responder = async (pedidoId: string, status: 'CONCEDIDO' | 'NEGADO') => {
        setActingId(pedidoId);
        try {
            await sessoesApi.responderPedidoPalavra(sessaoId, pedidoId, { status });
            showToast(
                'success',
                status === 'CONCEDIDO' ? 'Palavra concedida' : 'Pedido negado',
                status === 'CONCEDIDO'
                    ? 'O parlamentar pode usar a palavra.'
                    : 'O pedido foi negado.',
            );
            await carregar();
        } catch (err) {
            showToast(
                'error',
                'Pedido de palavra',
                err instanceof Error ? err.message : 'Não foi possível responder.',
            );
        } finally {
            setActingId(null);
        }
    };

    const encerrar = async (pedidoId: string) => {
        setActingId(pedidoId);
        try {
            await sessoesApi.encerrarPedidoPalavra(sessaoId, pedidoId);
            showToast('info', 'Palavra encerrada', 'O uso da palavra foi encerrado.');
            await carregar();
        } catch (err) {
            showToast(
                'error',
                'Pedido de palavra',
                err instanceof Error ? err.message : 'Não foi possível encerrar.',
            );
        } finally {
            setActingId(null);
        }
    };

    const ativos = pedidos.filter(
        (p) => p.status === 'AGUARDANDO' || p.status === 'CONCEDIDO',
    );
    const sessaoAberta = statusSessao === 'ABERTA';

    return (
        <section
            className={[
                'pedidos-palavra-panel',
                variant === 'presidente' ? 'pedidos-palavra-panel--presidente' : '',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="flex align-items-center justify-content-between mb-3 gap-2">
                <div>
                    <h3 className="m-0">
                        {variant === 'presidente' ? 'Gerenciar pedidos de palavra' : 'Fila de palavra'}
                    </h3>
                    <p className="m-0 mt-1 text-color-secondary text-sm">
                        {variant === 'presidente'
                            ? 'Como Presidente, aprove ou negue os pedidos dos demais vereadores.'
                            : 'Conceda ou negue os pedidos dos parlamentares.'}
                    </p>
                </div>
                <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    aria-label="Atualizar"
                    onClick={() => void carregar()}
                />
            </div>

            {!sessaoAberta ? (
                <p className="text-color-secondary m-0">
                    A fila fica ativa quando a sessão estiver aberta.
                </p>
            ) : loading ? (
                <div className="flex justify-content-center py-4">
                    <ProgressSpinner style={{ width: '36px', height: '36px' }} />
                </div>
            ) : ativos.length === 0 ? (
                <p className="text-color-secondary m-0">Nenhum pedido em andamento.</p>
            ) : (
                <ul className="pedidos-palavra-list">
                    {ativos.map((p) => (
                        <li key={p.id} className="pedidos-palavra-item">
                            <div>
                                <strong>{p.parlamentarNome || 'Parlamentar'}</strong>
                                {p.tema ? (
                                    <p className="m-0 mt-1 text-sm text-color-secondary">
                                        {p.tema}
                                    </p>
                                ) : null}
                                <span
                                    className={`pedidos-palavra-badge pedidos-palavra-badge--${p.status.toLowerCase()}`}
                                >
                                    {p.status === 'AGUARDANDO' ? 'Aguardando' : 'Com a palavra'}
                                </span>
                            </div>
                            <div className="pedidos-palavra-actions">
                                {p.status === 'AGUARDANDO' ? (
                                    <>
                                        <Button
                                            label="Conceder"
                                            icon="pi pi-check"
                                            size="small"
                                            loading={actingId === p.id}
                                            onClick={() => void responder(p.id, 'CONCEDIDO')}
                                        />
                                        <Button
                                            label="Negar"
                                            icon="pi pi-times"
                                            size="small"
                                            severity="secondary"
                                            outlined
                                            loading={actingId === p.id}
                                            onClick={() => void responder(p.id, 'NEGADO')}
                                        />
                                    </>
                                ) : (
                                    <Button
                                        label="Encerrar"
                                        icon="pi pi-stop"
                                        size="small"
                                        severity="danger"
                                        outlined
                                        loading={actingId === p.id}
                                        onClick={() => void encerrar(p.id)}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
