import type { ReactNode } from 'react';

type Props = {
  title?: string;
  description?: string;
  children: ReactNode;
};

/** Painel neutro para filtros + listagem (Normas e Atos). */
export function DocumentListPanel({ title = 'Registros', description, children }: Props) {
  return (
    <section className="page-panel document-list-panel" aria-labelledby="document-list-panel-title">
      <header className="page-panel__head">
        <h2 id="document-list-panel-title" className="page-panel__title">
          {title}
        </h2>
        {description && <p className="page-panel__desc">{description}</p>}
      </header>
      <div className="page-panel__body">{children}</div>
    </section>
  );
}
