import type { ReactNode } from 'react';
import { ModuleTitle } from './common/ModuleTitle';
import { useEmbeddedPage } from '../hooks/useEmbeddedPage';

type Props = {
  title: string;
  icon?: string;
  actions?: ReactNode;
};

export function PanelToolbar({ title, icon, actions }: Props) {
  const embedded = useEmbeddedPage();
  return (
    <div className="toolbar sigl-cluster sigl-cluster--loose">
      {embedded ? (
        <ModuleTitle icon={icon} as="h2" className="tab-panel-title">
          {title}
        </ModuleTitle>
      ) : (
        <ModuleTitle icon={icon} as="h1" className="page-title page-toolbar-title">
          {title}
        </ModuleTitle>
      )}
      {actions}
    </div>
  );
}
