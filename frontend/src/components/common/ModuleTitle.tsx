import { isValidElement, type ReactNode } from 'react';
import { resolveModuleHeaderIcon } from '../../app/module-header-icons';

type Props = {
    icon?: string | ReactNode;
    children: ReactNode;
    as?: 'h1' | 'h2' | 'span';
    className?: string;
};

function renderIcon(icon: string | ReactNode) {
    if (isValidElement(icon)) {
        return <span className="page-title-icon">{icon}</span>;
    }

    if (typeof icon !== 'string') return null;

    const MuiIcon = resolveModuleHeaderIcon(icon);
    if (MuiIcon) {
        return (
            <MuiIcon
                aria-hidden
                className="page-title-icon"
                sx={{
                    fontSize: 24,
                    flexShrink: 0,
                    color: 'var(--accent-icon)',
                }}
            />
        );
    }

    return <i className={`module-title__icon ${icon}`} aria-hidden />;
}

/** Título de módulo com ícone MUI (ou PrimeIcons legado). */
export function ModuleTitle({
    icon,
    children,
    as: Tag = 'span',
    className = '',
}: Props) {
    return (
        <Tag className={`module-title ${className}`.trim()}>
            {icon ? renderIcon(icon) : null}
            <span className="module-title__text">{children}</span>
        </Tag>
    );
}
