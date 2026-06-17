import type { ReactNode } from 'react';
import { ModuleTitle } from './common/ModuleTitle';

type Props = {
    title: string;
    icon?: string | ReactNode;
    subtitle?: string;
    actions?: ReactNode;
    /** Dentro de /camara — evita título duplicado do layout pai. */
    embedded?: boolean;
};

export function PageHeader({
    title,
    icon,
    subtitle,
    actions,
    embedded,
}: Props) {
    if (embedded) {
        return (
            <div className="page-header page-header--embedded">
                <div className="page-header--embedded__main">
                    <ModuleTitle
                        icon={icon}
                        as="h2"
                        className="tab-panel-title"
                    >
                        {title}
                    </ModuleTitle>
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
                {actions && (
                    <div className="page-header-actions sigl-cluster">
                        {actions}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="page-header">
            <div>
                <ModuleTitle icon={icon} as="h1" className="page-title">
                    {title}
                </ModuleTitle>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {actions && (
                <div className="page-header-actions sigl-cluster">
                    {actions}
                </div>
            )}
        </div>
    );
}
