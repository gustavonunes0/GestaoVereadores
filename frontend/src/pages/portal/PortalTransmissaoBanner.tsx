import { useEffect, useState } from 'react';
import {
    portalPublicApi,
    type PublicTransmissao,
} from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';

function youtubeEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be')) {
            const id = parsed.pathname.replace('/', '');
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (parsed.hostname.includes('youtube.com')) {
            const id = parsed.searchParams.get('v');
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
    } catch {
        return null;
    }
    return null;
}

export function PortalTransmissaoBanner() {
    const { slug, config } = usePortalPublic();
    const [transmissao, setTransmissao] = useState<PublicTransmissao | null>(null);

    useEffect(() => {
        if (!config?.secoes.transmissao) return;
        let cancelled = false;
        portalPublicApi
            .getTransmissao(slug)
            .then((res) => {
                if (!cancelled) setTransmissao(res.transmissao);
            })
            .catch(() => {
                if (!cancelled) setTransmissao(null);
            });
        return () => {
            cancelled = true;
        };
    }, [slug, config?.secoes.transmissao]);

    if (!transmissao) return null;

    const embed = youtubeEmbedUrl(transmissao.linkTransmissao);

    return (
        <section className="portal-transmissao">
            <div className="portal-transmissao__header">
                <h2>
                    {transmissao.aoVivo ? '🔴 Ao vivo' : 'Transmissão'}
                </h2>
                <p>{transmissao.titulo}</p>
                {transmissao.local ? (
                    <p className="portal-muted">Local: {transmissao.local}</p>
                ) : null}
            </div>
            {embed ? (
                <div className="portal-transmissao__embed">
                    <iframe
                        src={embed}
                        title={transmissao.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            ) : (
                <a
                    href={transmissao.linkTransmissao}
                    target="_blank"
                    rel="noreferrer"
                    className="portal-public__btn"
                >
                    Assistir transmissão
                </a>
            )}
        </section>
    );
}
