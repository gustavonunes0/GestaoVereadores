import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    portalPublicApi,
    type PublicParliamentarianDetail,
} from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';
import { PortalNotFoundPage } from './PortalNotFoundPage';

export function PortalVereadorDetailPage() {
    const { id = '' } = useParams<{ id: string }>();
    const { slug, basePath } = usePortalPublic();
    const [vereador, setVereador] = useState<PublicParliamentarianDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const data = await portalPublicApi.getVereador(slug, id);
                if (!cancelled) setVereador(data);
            } catch {
                if (!cancelled) {
                    setVereador(null);
                    setNotFound(true);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [slug, id]);

    if (loading) {
        return (
            <div className="portal-page portal-page__loading">
                <ProgressSpinner aria-label="Carregando vereador" />
            </div>
        );
    }

    if (notFound || !vereador) {
        return <PortalNotFoundPage message="Vereador não encontrado" />;
    }

    const initial = vereador.parliamentaryName.charAt(0).toUpperCase();

    return (
        <div className="portal-page">
            <Link to={`${basePath}/vereadores`} className="portal-back-link">
                ← Voltar para vereadores
            </Link>

            <div className="portal-vereador-detail">
                <div className="portal-vereador-detail__header">
                    {vereador.photoUrl ? (
                        <Avatar image={vereador.photoUrl} shape="circle" size="xlarge" />
                    ) : (
                        <Avatar label={initial} shape="circle" size="xlarge" />
                    )}
                    <div>
                        <h2 className="portal-page__title">{vereador.parliamentaryName}</h2>
                        {vereador.nomeCompleto ? (
                            <p className="portal-muted">{vereador.nomeCompleto}</p>
                        ) : null}
                        {vereador.partido ? (
                            <p className="portal-vereador-card__party">
                                {vereador.partido.sigla} — {vereador.partido.nome}
                            </p>
                        ) : null}
                        {vereador.officeNumber ? (
                            <p>Gabinete {vereador.officeNumber}</p>
                        ) : null}
                    </div>
                </div>

                {vereador.biography ? (
                    <section className="portal-section">
                        <h3>Biografia</h3>
                        <p className="portal-hero__text">{vereador.biography}</p>
                    </section>
                ) : null}

                {vereador.mandatos.length > 0 ? (
                    <section className="portal-section">
                        <h3>Mandatos</h3>
                        <ul className="portal-list">
                            {vereador.mandatos.map((m) => (
                                <li key={m.id}>
                                    {m.legislaturaNumero}ª legislatura —{' '}
                                    {new Date(m.startedAt).toLocaleDateString('pt-BR')}
                                    {m.endedAt
                                        ? ` a ${new Date(m.endedAt).toLocaleDateString('pt-BR')}`
                                        : ' (em exercício)'}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {vereador.comissoes.length > 0 ? (
                    <section className="portal-section">
                        <h3>Comissões</h3>
                        <ul className="portal-list">
                            {vereador.comissoes.map((c) => (
                                <li key={c.id}>
                                    {c.sigla ? `${c.sigla} — ` : ''}
                                    {c.nome}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {vereador.frentes.length > 0 ? (
                    <section className="portal-section">
                        <h3>Frentes parlamentares</h3>
                        <ul className="portal-list">
                            {vereador.frentes.map((f) => (
                                <li key={f.id}>{f.nome}</li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </div>
        </div>
    );
}
