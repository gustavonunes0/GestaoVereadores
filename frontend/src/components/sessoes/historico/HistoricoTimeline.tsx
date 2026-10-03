import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    sessoesApi,
    type SessaoHistoricoEvento,
} from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';

type EventCategory = 'sessao' | 'votacao' | 'presenca' | 'palavra' | 'ata' | 'outro';

type FilterId = 'todos' | EventCategory;

const EVENT_META: Record<
    string,
    { icon: string; category: EventCategory }
> = {
    SESSAO_ABERTA: { icon: 'pi pi-play', category: 'sessao' },
    SESSAO_SUSPENSA: { icon: 'pi pi-pause', category: 'sessao' },
    SESSAO_ENCERRADA: { icon: 'pi pi-stop', category: 'sessao' },
    SESSAO_CANCELADA: { icon: 'pi pi-times', category: 'sessao' },
    FASE_ALTERADA: { icon: 'pi pi-sitemap', category: 'sessao' },
    CHAMADA_REALIZADA: { icon: 'pi pi-users', category: 'presenca' },
    CHAMADA_REINICIADA: { icon: 'pi pi-refresh', category: 'presenca' },
    PRESENCA_REGISTRADA: { icon: 'pi pi-user-plus', category: 'presenca' },
    VOTACAO_ABERTA: { icon: 'pi pi-megaphone', category: 'votacao' },
    VOTACAO_ENCERRADA: { icon: 'pi pi-check', category: 'votacao' },
    PEDIDO_PALAVRA_CRIADO: { icon: 'pi pi-microphone', category: 'palavra' },
    PEDIDO_PALAVRA_RESPONDIDO: { icon: 'pi pi-reply', category: 'palavra' },
    ATA_GERADA: { icon: 'pi pi-file', category: 'ata' },
    ATA_APROVADA: { icon: 'pi pi-verified', category: 'ata' },
};

const FILTERS: Array<{ id: FilterId; label: string }> = [
    { id: 'todos', label: 'Todos' },
    { id: 'sessao', label: 'Sessão' },
    { id: 'votacao', label: 'Votações' },
    { id: 'presenca', label: 'Presenças' },
    { id: 'palavra', label: 'Palavra' },
    { id: 'ata', label: 'Ata' },
];

function getMeta(tipo: string) {
    return EVENT_META[tipo] ?? { icon: 'pi pi-circle', category: 'outro' as const };
}

function formatDayKey(iso: string): string {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDayLabel(dayKey: string): string {
    const [y, m, d] = dayKey.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (sameDay(date, today)) return 'Hoje';
    if (sameDay(date, yesterday)) return 'Ontem';

    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function extractResultado(descricao: string | null): {
    clean: string | null;
    resultado: 'APROVADO' | 'REJEITADO' | 'EMPATE' | null;
} {
    if (!descricao?.trim()) return { clean: null, resultado: null };
    const match = descricao.match(/\b(APROVADO|REJEITADO|EMPATE)\b/i);
    if (!match) return { clean: descricao, resultado: null };
    const resultado = match[1].toUpperCase() as 'APROVADO' | 'REJEITADO' | 'EMPATE';
    const clean = descricao
        .replace(/\s*—\s*resultado\s+\w+/i, '')
        .replace(/\s+resultado\s+\w+/i, '')
        .trim();
    return { clean: clean || null, resultado };
}

export function HistoricoTimeline({ sessaoId }: { sessaoId: string }) {
    const { showApiError } = useAppToast();
    const [eventos, setEventos] = useState<SessaoHistoricoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [filtro, setFiltro] = useState<FilterId>('todos');

    const carregar = useCallback(
        async (pageAtual: number, acumular: boolean) => {
            setLoading(true);
            try {
                const result = await sessoesApi.getHistorico(sessaoId, {
                    page: pageAtual,
                    limit: 30,
                });
                setEventos((prev) =>
                    acumular ? [...prev, ...result.data] : result.data,
                );
                setTotalPages(result.meta.totalPages);
                setTotal(result.meta.total);
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

    const filtrados = useMemo(() => {
        if (filtro === 'todos') return eventos;
        return eventos.filter(
            (e) => getMeta(e.tipoEvento.value).category === filtro,
        );
    }, [eventos, filtro]);

    const grupos = useMemo(() => {
        const map = new Map<string, SessaoHistoricoEvento[]>();
        for (const evento of filtrados) {
            const key = formatDayKey(evento.dataHora);
            const list = map.get(key) ?? [];
            list.push(evento);
            map.set(key, list);
        }
        return Array.from(map.entries());
    }, [filtrados]);

    const counts = useMemo(() => {
        const base: Record<FilterId, number> = {
            todos: eventos.length,
            sessao: 0,
            votacao: 0,
            presenca: 0,
            palavra: 0,
            ata: 0,
            outro: 0,
        };
        for (const e of eventos) {
            base[getMeta(e.tipoEvento.value).category] += 1;
        }
        return base;
    }, [eventos]);

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
        <section className="historico-panel" aria-label="Histórico da sessão">
            <header className="historico-panel__header">
                <div>
                    <h3 className="historico-panel__title">Linha do tempo</h3>
                    <p className="historico-panel__subtitle">
                        {total} evento{total === 1 ? '' : 's'} registrados nesta
                        sessão
                    </p>
                </div>
            </header>

            <div className="historico-filters" role="tablist" aria-label="Filtrar eventos">
                {FILTERS.map((f) => {
                    const count = counts[f.id];
                    if (f.id !== 'todos' && count === 0) return null;
                    const active = filtro === f.id;
                    return (
                        <button
                            key={f.id}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`historico-filter${active ? ' is-active' : ''}`}
                            onClick={() => setFiltro(f.id)}
                        >
                            {f.label}
                            <span className="historico-filter__count">{count}</span>
                        </button>
                    );
                })}
            </div>

            {filtrados.length === 0 ? (
                <div className="sessao-empty-state sessao-empty-state--compact">
                    <i className="pi pi-filter" aria-hidden />
                    <span>Nenhum evento neste filtro.</span>
                </div>
            ) : (
                <div className="historico-timeline">
                    {grupos.map(([dayKey, items]) => (
                        <div key={dayKey} className="historico-day">
                            <div className="historico-day__label">
                                <span>{formatDayLabel(dayKey)}</span>
                            </div>
                            <ol className="historico-day__list">
                                {items.map((evento) => {
                                    const meta = getMeta(evento.tipoEvento.value);
                                    const { clean, resultado } = extractResultado(
                                        evento.descricao,
                                    );
                                    return (
                                        <li
                                            key={evento.id}
                                            className={`historico-event historico-event--${meta.category}`}
                                        >
                                            <div className="historico-event__rail" aria-hidden>
                                                <span className="historico-event__dot">
                                                    <i className={meta.icon} />
                                                </span>
                                            </div>
                                            <div className="historico-event__card">
                                                <div className="historico-event__meta">
                                                    <time dateTime={evento.dataHora}>
                                                        {formatTime(evento.dataHora)}
                                                    </time>
                                                    <span className="historico-event__category">
                                                        {FILTERS.find(
                                                            (f) => f.id === meta.category,
                                                        )?.label ?? 'Evento'}
                                                    </span>
                                                </div>
                                                <h4 className="historico-event__title">
                                                    {evento.tipoEvento.label}
                                                </h4>
                                                {(clean || resultado) && (
                                                    <p className="historico-event__desc">
                                                        {clean}
                                                        {resultado ? (
                                                            <span
                                                                className={`historico-result historico-result--${resultado.toLowerCase()}`}
                                                            >
                                                                {resultado}
                                                            </span>
                                                        ) : null}
                                                    </p>
                                                )}
                                                {evento.responsavel?.nome ? (
                                                    <p className="historico-event__actor">
                                                        <i className="pi pi-user" aria-hidden />
                                                        {evento.responsavel.nome}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    ))}
                </div>
            )}

            {page < totalPages && (
                <div className="historico-panel__more">
                    <Button
                        label="Carregar mais eventos"
                        icon="pi pi-chevron-down"
                        outlined
                        size="small"
                        loading={loading}
                        onClick={() => void carregar(page + 1, true)}
                    />
                </div>
            )}
        </section>
    );
}
