import type { ReactNode } from 'react';

type MetaItem = {
    label: string;
    value: ReactNode;
};

type Props = {
    items: MetaItem[];
};

/** Metadados em blocos para visualização de detalhe (norma ou ato). */
export function PublicacaoMetaGrid({ items }: Props) {
    return (
        <dl className="publicacao-meta-grid">
            {items.map((item) => (
                <div key={item.label} className="publicacao-meta-grid__item">
                    <dt>{item.label}</dt>
                    <dd>{item.value ?? '—'}</dd>
                </div>
            ))}
        </dl>
    );
}
