import { useCallback, useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { portalPublicApi, type PublicNorma } from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';

export function PortalNormasPage() {
    const { slug } = usePortalPublic();
    const [items, setItems] = useState<PublicNorma[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchApplied, setSearchApplied] = useState('');

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await portalPublicApi.listNormas(slug, {
                search: searchApplied || undefined,
                limit: 50,
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
            <h2 className="portal-page__title">Normas jurídicas</h2>

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
                    placeholder="Buscar por ementa ou número..."
                    className="portal-filters__input"
                />
                <button type="submit" className="portal-public__btn">
                    Buscar
                </button>
            </form>

            {loading ? (
                <div className="portal-page__loading">
                    <ProgressSpinner aria-label="Carregando normas" />
                </div>
            ) : items.length === 0 ? (
                <p className="portal-empty">Nenhuma norma encontrada.</p>
            ) : (
                <ul className="portal-normas-list">
                    {items.map((norma) => (
                        <li key={norma.id} className="portal-norma-item">
                            <h3>
                                {norma.tipo.nome} nº {norma.numero}
                                {norma.ano ? `/${norma.ano.valor}` : ''}
                            </h3>
                            <p>{norma.ementa}</p>
                            {norma.dataPublicacao ? (
                                <p className="portal-muted">
                                    Publicação:{' '}
                                    {new Date(norma.dataPublicacao).toLocaleDateString('pt-BR')}
                                </p>
                            ) : null}
                            {norma.textoIntegralUrl ? (
                                <a
                                    href={norma.textoIntegralUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="portal-link"
                                >
                                    Texto integral
                                </a>
                            ) : null}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
