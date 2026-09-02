import type { ReactNode } from 'react';
import { LexFormDialogShell, type LexFormDialogTab } from '../ui/LexFormDialogShell';

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
    const lexTabs: LexFormDialogTab[] = tabs.map((id) => ({
        id,
        label: TAB_LABELS[id],
    }));

    return (
        <LexFormDialogShell
            title={title}
            icon={icon}
            tabs={lexTabs}
            activeTab={activeTab}
            onTabChange={(id) => onTabChange(id as MateriaFormTab)}
            onClose={onClose}
            footer={footer}
            saving={saving}
            className="materia-form-dialog"
        >
            {children}
        </LexFormDialogShell>
    );
}
