import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    portalPublicApi,
    type PublicComissaoDetail,
} from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';
import { PortalNotFoundPage } from './PortalNotFoundPage';

const TIPO_LABEL: Record<string, string> = {
    PERMANENT: 'Permanente',
    TEMPORARY: 'Temporária',
};

export function PortalComissaoDetailPage() {
    const { id = '' } = useParams<{ id: string }>();
    const { slug, basePath } = usePortalPublic();
    const [comissao, setComissao] = useState<PublicComissaoDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const data = await portalPublicApi.getComissao(slug, id);
                if (!cancelled) setComissao(data);
            } catch {
                if (!cancelled) {
                    setComissao(null);
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
                <ProgressSpinner aria-label="Carregando comissão" />
            </div>
        );
    }

    if (notFound || !comissao) {
        return <PortalNotFoundPage message="Comissão não encontrada" />;
    }

    return (
        <div className="portal-page">
            <Link to={`${basePath}/comissoes`} className="portal-back-link">
                ← Voltar para comissões
            </Link>

            <h2 className="portal-page__title">
                {comissao.sigla ? `${comissao.sigla} — ` : ''}
                {comissao.nome}
            </h2>
            <p className="portal-muted">
                {TIPO_LABEL[comissao.tipo] ?? comissao.tipo}
            </p>
            <p className="portal-hero__text">{comissao.finalidade}</p>

            {comissao.membros.length > 0 ? (
                <section className="portal-section">
                    <h3>Composição</h3>
                    <ul className="portal-list portal-list--members">
                        {comissao.membros.map((membro) => (
                            <li key={membro.id}>
                                <strong>{membro.papelLabel}:</strong>{' '}
                                <Link to={`${basePath}/vereadores/${membro.parlamentar.id}`}>
                                    {membro.parlamentar.parliamentaryName}
                                </Link>
                                {membro.parlamentar.officeNumber
                                    ? ` (Gabinete ${membro.parlamentar.officeNumber})`
                                    : ''}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
}
