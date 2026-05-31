import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Dentro de /camara ou /publicacao — evita título duplicado do layout pai. */
  embedded?: boolean;
};

export function PageHeader({ title, subtitle, actions, embedded }: Props) {
  if (embedded) {
    return (
      <div className="page-header page-header--embedded">
        <div className="page-header--embedded__main">
          <h2 className="tab-panel-title">{title}</h2>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions sigl-cluster">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions sigl-cluster">{actions}</div>}
    </div>
  );
}
