import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

export type MateriaFormTab = 'identificacao' | 'autoria' | 'conteudo' | 'status';

const TAB_LABELS: Record<MateriaFormTab, string> = {
    identificacao: 'Identificação',
    autoria: 'Autoria',
    conteudo: 'Conteúdo',
    status: 'Status',
};

interface Props {
    title: string;
    icon?: string;
    tabs: MateriaFormTab[];
    activeTab: MateriaFormTab;
    onTabChange: (tab: MateriaFormTab) => void;
    onClose: () => void;
    footer: ReactNode;
    saving?: boolean;
    children: ReactNode;
}

export function MateriaFormShell({
    title,
    icon = 'pi-file-plus',
    tabs,
    activeTab,
    onTabChange,
    onClose,
    footer,
    saving = false,
    children,
}: Props) {
    return (
        <Dialog
            visible
            onHide={() => !saving && onClose()}
            showHeader={false}
            contentStyle={{ padding: 0, overflow: 'visible' }}
            style={{ width: 'min(96vw, 720px)' }}
            className="materia-form-dialog"
            modal
            dismissableMask={!saving}
        >
            <div className="materia-form-card">
                <div className="materia-form-card-header">
                    <span className="materia-form-card-title">
                        <i className={`pi ${icon}`} aria-hidden />
                        {title}
                    </span>
                    <Button
                        type="button"
                        icon="pi pi-times"
                        text
                        rounded
                        severity="secondary"
                        className="materia-form-close"
                        aria-label="Fechar"
                        onClick={onClose}
                        disabled={saving}
                    />
                </div>

                <div className="materia-form-tabs" role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab}
                            className={`materia-form-tab${activeTab === tab ? ' active' : ''}`}
                            onClick={() => onTabChange(tab)}
                        >
                            {TAB_LABELS[tab]}
                        </button>
                    ))}
                </div>

                <div className="materia-form-card-body">{children}</div>

                <div className="materia-form-footer">{footer}</div>
            </div>
        </Dialog>
    );
}
