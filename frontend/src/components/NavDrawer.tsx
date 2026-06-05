import type { ReactNode } from 'react';
import { Sidebar } from 'primereact/sidebar';

type Props = {
  visible: boolean;
  onHide: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Formulários extensos (ex.: parlamentar, sessão). */
  wide?: boolean;
};

/** Painel lateral para detalhes e formulários ao selecionar item na listagem. */
export function NavDrawer({
  visible,
  onHide,
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: Props) {
  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      position="right"
      blockScroll
      dismissable
      className={`nav-drawer${wide ? ' nav-drawer--wide' : ''}`}
      header={
        <div className="nav-drawer__heading">
          <h2 id="nav-drawer-title" className="nav-drawer__title">
            {title}
          </h2>
          {subtitle && <p className="nav-drawer__subtitle">{subtitle}</p>}
        </div>
      }
      aria-labelledby="nav-drawer-title"
    >
      <div className="nav-drawer__body">{children}</div>
      {footer && <div className="nav-drawer__footer">{footer}</div>}
    </Sidebar>
  );
}
