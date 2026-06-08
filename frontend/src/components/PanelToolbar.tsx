import type { ReactNode } from 'react';
import { ModuleTitle } from './common/ModuleTitle';

type Props = {
    title: string;
    icon?: string;
    actions?: ReactNode;
};

export function PanelToolbar({ title, icon, actions }: Props) {
    return (
        <div className="toolbar sigl-cluster sigl-cluster--loose">
            <ModuleTitle
                icon={icon}
                as="h1"
                className="page-title page-toolbar-title"
            >
                {title}
            </ModuleTitle>
            {actions && <div className="toolbar__actions">{actions}</div>}
        </div>
    );
}
