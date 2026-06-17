import { useCallback, useEffect, useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { portalPublicApi, type PublicAgendaItem } from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';

function formatDate(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

export function PortalAgendaPage() {
    const { slug } = usePortalPublic();
    const [items, setItems] = useState<PublicAgendaItem[]>([]);
    const [loading, setLoading] = useState(true);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await portalPublicApi.listAgenda(slug, { limit: 50 });
            setItems(res.data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    return (
        <div className="portal-page">
            <h2 className="portal-page__title">Agenda legislativa</h2>

            {loading ? (
                <div className="portal-page__loading">
                    <ProgressSpinner aria-label="Carregando agenda" />
                </div>
            ) : items.length === 0 ? (
                <p className="portal-empty">Nenhum evento público na agenda.</p>
            ) : (
                <ul className="portal-agenda-list">
                    {items.map((item) => (
                        <li key={item.id} className="portal-agenda-item">
                            <div className="portal-agenda-item__meta">
                                <span className="portal-agenda-item__date">
                                    {formatDate(item.dataInicio)}
                                </span>
                                {item.tipoLabel ? (
                                    <span className="portal-agenda-item__type">
                                        {item.tipoLabel}
                                    </span>
                                ) : null}
                            </div>
                            <h3>{item.titulo ?? item.mensagem ?? 'Evento'}</h3>
                            {item.descricao ? <p>{item.descricao}</p> : null}
                            {item.local ? (
                                <p className="portal-muted">Local: {item.local}</p>
                            ) : null}
                            {item.linkTransmissao ? (
                                <a
                                    href={item.linkTransmissao}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="portal-link"
                                >
                                    Assistir transmissão
                                </a>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
