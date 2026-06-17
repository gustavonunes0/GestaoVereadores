import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { portalPublicApi, type PublicComissao } from '../../api/portal/portal-public.api';
import { usePortalPublic } from '../../contexts/PortalPublicContext';

const TIPO_LABEL: Record<string, string> = {
    PERMANENT: 'Permanente',
    TEMPORARY: 'Temporária',
};

export function PortalComissoesPage() {
    const { slug, basePath } = usePortalPublic();
    const [items, setItems] = useState<PublicComissao[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchApplied, setSearchApplied] = useState('');

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await portalPublicApi.listComissoes(slug, {
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
            <h2 className="portal-page__title">Comissões</h2>

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
                    placeholder="Buscar por nome ou sigla..."
                    className="portal-filters__input"
                />
                <button type="submit" className="portal-public__btn">
                    Buscar
                </button>
            </form>

            {loading ? (
                <div className="portal-page__loading">
                    <ProgressSpinner aria-label="Carregando comissões" />
                </div>
            ) : items.length === 0 ? (
                <p className="portal-empty">Nenhuma comissão encontrada.</p>
            ) : (
                <ul className="portal-comissoes-list">
                    {items.map((comissao) => (
                        <li key={comissao.id}>
                            <Link
                                to={`${basePath}/comissoes/${comissao.id}`}
                                className="portal-comissao-card"
                            >
                                <h3>
                                    {comissao.sigla
                                        ? `${comissao.sigla} — ${comissao.nome}`
                                        : comissao.nome}
                                </h3>
                                <p className="portal-muted">
                                    {TIPO_LABEL[comissao.tipo] ?? comissao.tipo} ·{' '}
                                    {comissao.totalMembros} membro
                                    {comissao.totalMembros === 1 ? '' : 's'}
                                </p>
                                {comissao.presidente ? (
                                    <p>
                                        Presidente: {comissao.presidente.parliamentaryName}
                                    </p>
                                ) : null}
                                <p className="portal-comissao-card__purpose">
                                    {comissao.finalidade}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
