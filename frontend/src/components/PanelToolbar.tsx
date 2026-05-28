import type { ReactNode } from 'react';
import { useEmbeddedPage } from '../hooks/useEmbeddedPage';

type Props = {
  title: string;
  actions?: ReactNode;
};

export function PanelToolbar({ title, actions }: Props) {
  const embedded = useEmbeddedPage();
  return (
    <div className="toolbar">
      {embedded ? (
        <h2 className="tab-panel-title">{title}</h2>
      ) : (
        <h1 className="page-title" style={{ margin: 0 }}>
          {title}
        </h1>
      )}
      {actions}
    </div>
  );
}
