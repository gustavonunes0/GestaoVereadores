import type { ReactNode } from 'react';

type Props = {
  icon?: string;
  children: ReactNode;
  as?: 'h1' | 'h2' | 'span';
  className?: string;
};

/** Título de módulo com ícone PrimeIcons (classe `pi pi-*`). */
export function ModuleTitle({ icon, children, as: Tag = 'span', className = '' }: Props) {
  return (
    <Tag className={`module-title ${className}`.trim()}>
      {icon ? <i className={`module-title__icon ${icon}`} aria-hidden /> : null}
      <span className="module-title__text">{children}</span>
    </Tag>
  );
}
