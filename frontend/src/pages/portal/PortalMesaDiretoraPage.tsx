import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    portalPublicApi,
    type PublicMesaDiretora,
} from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';

export function PortalMesaDiretoraPage() {
    const { slug, basePath } = usePortalPublic();
    const [mesa, setMesa] = useState<PublicMesaDiretora | null>(null);
    const [loading, setLoading] = useState(true);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await portalPublicApi.getMesaDiretora(slug);
            setMesa(res.mesa);
        } catch {
            setMesa(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    return (
        <div className="portal-page">
            <h2 className="portal-page__title">Mesa Diretora</h2>

            {loading ? (
                <div className="portal-page__loading">
                    <ProgressSpinner aria-label="Carregando mesa diretora" />
                </div>
            ) : !mesa ? (
                <p className="portal-empty">
                    Nenhuma mesa diretora ativa cadastrada.
                </p>
            ) : (
                <>
                    <p className="portal-muted">
                        {mesa.name} — {mesa.legislaturaNumero}ª legislatura
                    </p>
                    <div className="portal-mesa-grid">
                        {mesa.members.map((membro) => {
                            const initial =
                                membro.parlamentar.parliamentaryName.charAt(0).toUpperCase();
                            return (
                                <article key={membro.id} className="portal-mesa-card">
                                    <div className="portal-mesa-card__cargo">
                                        {membro.cargo}
                                    </div>
                                    <Link
                                        to={`${basePath}/vereadores/${membro.parlamentar.id}`}
                                        className="portal-mesa-card__link"
                                    >
                                        {membro.parlamentar.photoUrl ? (
                                            <Avatar
                                                image={membro.parlamentar.photoUrl}
                                                shape="circle"
                                                size="xlarge"
                                            />
                                        ) : (
                                            <Avatar
                                                label={initial}
                                                shape="circle"
                                                size="xlarge"
                                            />
                                        )}
                                        <h3>{membro.parlamentar.parliamentaryName}</h3>
                                        {membro.parlamentar.partido ? (
                                            <p className="portal-vereador-card__party">
                                                {membro.parlamentar.partido.sigla}
                                            </p>
                                        ) : null}
                                    </Link>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
