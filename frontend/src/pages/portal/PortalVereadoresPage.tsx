import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { portalPublicApi, type PublicParliamentarian } from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';

export function PortalVereadoresPage() {
    const { slug, basePath } = usePortalPublic();
    const [items, setItems] = useState<PublicParliamentarian[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchApplied, setSearchApplied] = useState('');

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await portalPublicApi.listVereadores(slug, {
                search: searchApplied || undefined,
                limit: 100,
            });
            setItems(res.data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [slug, searchApplied]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    return (
        <div className="portal-page">
            <h2 className="portal-page__title">Vereadores</h2>

            <form
                className="portal-filters"
                onSubmit={(e) => {
                    e.preventDefault();
                    setSearchApplied(search.trim());
                }}
            >
                <InputText
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="portal-filters__input"
                />
                <button type="submit" className="portal-public__btn">
                    Buscar
                </button>
            </form>

            {loading ? (
                <div className="portal-page__loading">
                    <ProgressSpinner aria-label="Carregando vereadores" />
                </div>
            ) : items.length === 0 ? (
                <p className="portal-empty">Nenhum vereador encontrado.</p>
            ) : (
                <div className="portal-vereadores-grid">
                    {items.map((v) => {
                        const initial = v.parliamentaryName.charAt(0).toUpperCase();
                        return (
                            <Link
                                key={v.id}
                                to={`${basePath}/vereadores/${v.id}`}
                                className="portal-vereador-card"
                            >
                                <div className="portal-vereador-card__avatar">
                                    {v.photoUrl ? (
                                        <Avatar image={v.photoUrl} shape="circle" size="xlarge" />
                                    ) : (
                                        <Avatar label={initial} shape="circle" size="xlarge" />
                                    )}
                                </div>
                                <h3>{v.parliamentaryName}</h3>
                                {v.partido ? (
                                    <p className="portal-vereador-card__party">
                                        {v.partido.sigla}
                                    </p>
                                ) : null}
                                {v.officeNumber ? (
                                    <p className="portal-vereador-card__office">
                                        Gabinete {v.officeNumber}
                                    </p>
                                ) : null}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
