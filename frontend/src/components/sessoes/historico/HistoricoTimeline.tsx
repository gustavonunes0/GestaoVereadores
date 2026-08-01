import { useCallback, useEffect, useState } from 'react';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi, type SessaoHistoricoEvento } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';

const ICONS: Record<string, string> = {
    SESSAO_ABERTA: 'pi pi-play-circle',
    SESSAO_SUSPENSA: 'pi pi-pause-circle',
    SESSAO_ENCERRADA: 'pi pi-stop-circle',
    SESSAO_CANCELADA: 'pi pi-times-circle',
    FASE_ALTERADA: 'pi pi-arrow-right-arrow-left',
    CHAMADA_REALIZADA: 'pi pi-verified',
    CHAMADA_REINICIADA: 'pi pi-refresh',
    PRESENCA_REGISTRADA: 'pi pi-user-plus',
    VOTACAO_ABERTA: 'pi pi-megaphone',
    VOTACAO_ENCERRADA: 'pi pi-check-square',
    PEDIDO_PALAVRA_CRIADO: 'pi pi-comment',
    PEDIDO_PALAVRA_RESPONDIDO: 'pi pi-reply',
    ATA_GERADA: 'pi pi-file',
    ATA_APROVADA: 'pi pi-file-check',
};

export function HistoricoTimeline({ sessaoId }: { sessaoId: string }) {
    const { showApiError } = useAppToast();
    const [eventos, setEventos] = useState<SessaoHistoricoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const carregar = useCallback(
        async (pageAtual: number, acumular: boolean) => {
            setLoading(true);
            try {
                const result = await sessoesApi.getHistorico(sessaoId, { page: pageAtual, limit: 20 });
                setEventos((prev) => (acumular ? [...prev, ...result.data] : result.data));
                setTotalPages(result.meta.totalPages);
                setPage(pageAtual);
            } catch (err) {
                showApiError(err);
            } finally {
                setLoading(false);
            }
        },
        [sessaoId, showApiError],
    );

    useEffect(() => {
        void carregar(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessaoId]);

    if (loading && eventos.length === 0) {
        return (
            <div className="flex justify-content-center p-4">
                <ProgressSpinner style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    if (eventos.length === 0) {
        return (
            <div className="sessao-empty-state sessao-empty-state--compact">
                <i className="pi pi-history" aria-hidden />
                <span>Nenhum evento registrado nesta sessão ainda.</span>
            </div>
        );
    }

    return (
        <div className="historico-timeline">
            <Timeline
                value={eventos}
                opposite={(evento: SessaoHistoricoEvento) =>
                    new Date(evento.dataHora).toLocaleString('pt-BR')
                }
                marker={(evento: SessaoHistoricoEvento) => (
                    <span className="historico-timeline__marker">
                        <i className={ICONS[evento.tipoEvento.value] ?? 'pi pi-circle'} aria-hidden />
                    </span>
                )}
                content={(evento: SessaoHistoricoEvento) => (
                    <div className="historico-timeline__item">
                        <strong>{evento.tipoEvento.label}</strong>
                        {evento.descricao && <p>{evento.descricao}</p>}
                        {evento.responsavel?.nome && (
                            <span className="text-muted">por {evento.responsavel.nome}</span>
                        )}
                    </div>
                )}
            />
            {page < totalPages && (
                <div className="flex justify-content-center mt-3">
                    <Button
                        label="Carregar mais"
                        icon="pi pi-chevron-down"
                        text
                        loading={loading}
                        onClick={() => void carregar(page + 1, true)}
                    />
                </div>
            )}
        </div>
    );
}
