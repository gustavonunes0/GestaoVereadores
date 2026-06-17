import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    portalPublicApi,
    type PublicAgendaItem,
    type PublicMesaDiretora,
} from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';
import { PortalTransmissaoBanner } from './PortalTransmissaoBanner';

function formatDate(value?: string) {
    if (!value) return '—';
    return new Date(value).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

export function PortalHomePage() {
    const { config, basePath, slug } = usePortalPublic();
    const [agenda, setAgenda] = useState<PublicAgendaItem[]>([]);
    const [mesa, setMesa] = useState<PublicMesaDiretora | null>(null);

    useEffect(() => {
        if (!config) return;
        let cancelled = false;

        const tasks: Promise<void>[] = [];

        if (config.secoes.agenda) {
            tasks.push(
                portalPublicApi
                    .listAgenda(slug, { limit: 3 })
                    .then((res) => {
                        if (!cancelled) setAgenda(res.data);
                    })
                    .catch(() => {
                        if (!cancelled) setAgenda([]);
                    }),
            );
        }

        if (config.secoes.mesaDiretora) {
            tasks.push(
                portalPublicApi
                    .getMesaDiretora(slug)
                    .then((res) => {
                        if (!cancelled) setMesa(res.mesa);
                    })
                    .catch(() => {
                        if (!cancelled) setMesa(null);
                    }),
            );
        }

        void Promise.all(tasks);
        return () => {
            cancelled = true;
        };
    }, [config, slug]);

    if (!config) return null;

    const links = [
        config.secoes.vereadores
            ? { to: `${basePath}/vereadores`, label: 'Vereadores', desc: 'Conheça os parlamentares' }
            : null,
        config.secoes.mesaDiretora
            ? { to: `${basePath}/mesa-diretora`, label: 'Mesa Diretora', desc: 'Composição da mesa' }
            : null,
        config.secoes.comissoes
            ? { to: `${basePath}/comissoes`, label: 'Comissões', desc: 'Comissões permanentes e temporárias' }
            : null,
        config.secoes.agenda
            ? { to: `${basePath}/agenda`, label: 'Agenda', desc: 'Eventos e sessões' }
            : null,
        config.secoes.normas
            ? { to: `${basePath}/normas`, label: 'Normas', desc: 'Legislação municipal' }
            : null,
        { to: `${basePath}/contato`, label: 'Contato', desc: 'Fale com a Câmara' },
    ].filter(Boolean) as Array<{ to: string; label: string; desc: string }>;

    return (
        <div className="portal-page">
            <PortalTransmissaoBanner />

            <section className="portal-hero">
                <h2 className="portal-page__title">Bem-vindo</h2>
                {config.sobre ? (
                    <p className="portal-hero__text">{config.sobre}</p>
                ) : (
                    <p className="portal-hero__text">
                        Portal institucional da {config.titulo}. Acesse as seções abaixo para
                        informações sobre a atividade legislativa.
                    </p>
                )}
            </section>

            {config.secoes.agenda && agenda.length > 0 ? (
                <section className="portal-section">
                    <div className="portal-section__header">
                        <h3>Próximos eventos</h3>
                        <Link to={`${basePath}/agenda`} className="portal-link">
                            Ver agenda completa
                        </Link>
                    </div>
                    <ul className="portal-agenda-list">
                        {agenda.map((item) => (
                            <li key={item.id} className="portal-agenda-item portal-agenda-item--compact">
                                <span className="portal-agenda-item__date">
                                    {formatDate(item.dataInicio)}
                                </span>
                                <strong>{item.titulo ?? item.mensagem ?? 'Evento'}</strong>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {config.secoes.mesaDiretora && mesa && mesa.members.length > 0 ? (
                <section className="portal-section">
                    <div className="portal-section__header">
                        <h3>Mesa Diretora</h3>
                        <Link to={`${basePath}/mesa-diretora`} className="portal-link">
                            Ver composição completa
                        </Link>
                    </div>
                    <div className="portal-mesa-grid portal-mesa-grid--compact">
                        {mesa.members.slice(0, 4).map((membro) => (
                            <div key={membro.id} className="portal-mesa-card portal-mesa-card--compact">
                                <span className="portal-mesa-card__cargo">{membro.cargo}</span>
                                <strong>{membro.parlamentar.parliamentaryName}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className="portal-cards">
                {links.map((item) => (
                    <Link key={item.to} to={item.to} className="portal-card">
                        <h3>{item.label}</h3>
                        <p>{item.desc}</p>
                    </Link>
                ))}
            </section>
        </div>
    );
}
