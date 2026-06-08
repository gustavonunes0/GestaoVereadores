import { useEffect, useState, type ReactNode } from 'react';

type Props = {
    title: string;
    activeCount: number;
    chips: string[];
    hasFilters: boolean;
    resultCount?: number;
    searchGeneration?: number;
    onPesquisar: () => void;
    onClear: () => void;
    children: ReactNode;
};

export function PesquisaFiltersCard({
    title,
    activeCount,
    chips,
    hasFilters,
    resultCount,
    searchGeneration = 0,
    onPesquisar,
    onClear,
    children,
}: Props) {
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (searchGeneration > 0) setExpanded(false);
    }, [searchGeneration]);

    return (
        <section className="sessao-filters-card" aria-label={title}>
            <header className="sessao-filters-card__header">
                <button
                    type="button"
                    className="sessao-filters-card__toggle"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                >
                    <i
                        className={`pi ${expanded ? 'pi-chevron-up' : 'pi-chevron-down'}`}
                        aria-hidden
                    />
                    <span>{title}</span>
                    {activeCount > 0 && (
                        <span className="sessao-filters-card__badge">
                            {activeCount}
                        </span>
                    )}
                </button>
                <div className="sessao-filters-card__header-actions">
                    {typeof resultCount === 'number' && (
                        <span className="sessao-filters-card__results muted">
                            {resultCount} registro{resultCount === 1 ? '' : 's'}
                        </span>
                    )}
                    {hasFilters && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onClear}
                        >
                            Limpar
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={onPesquisar}
                    >
                        Pesquisar
                    </button>
                </div>
            </header>

            {!expanded && chips.length > 0 && (
                <div className="sessao-filters-chips">
                    {chips.map((c) => (
                        <span key={c} className="filter-chip">
                            {c}
                        </span>
                    ))}
                </div>
            )}

            {expanded && (
                <div className="sessao-filters-card__body">{children}</div>
            )}
        </section>
    );
}
