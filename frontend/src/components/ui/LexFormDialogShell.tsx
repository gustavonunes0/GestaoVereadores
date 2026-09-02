import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { LexDialog } from './LexDialog';

export interface LexFormDialogTab {
    id: string;
    label: string;
}

interface LexFormDialogShellProps {
    title: string;
    icon?: string;
    tabs?: LexFormDialogTab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    onClose: () => void;
    footer: ReactNode;
    saving?: boolean;
    width?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Shell de formulário com header, abas opcionais e footer fixo (design Lex).
 */
export function LexFormDialogShell({
    title,
    icon = 'pi-pencil',
    tabs,
    activeTab,
    onTabChange,
    onClose,
    footer,
    saving = false,
    width = 'min(96vw, 56rem)',
    className,
    children,
}: LexFormDialogShellProps) {
    return (
        <LexDialog
            visible
            variant="form"
            onHide={() => !saving && onClose()}
            showHeader={false}
            contentStyle={{ padding: 0, overflow: 'visible' }}
            style={{ width }}
            className={className}
            modal
            dismissableMask={!saving}
        >
            <div className="lex-dialog-form-card">
                <header className="lex-dialog-form-header">
                    <span className="lex-dialog-form-title">
                        <i className={`pi ${icon}`} aria-hidden />
                        {title}
                    </span>
                    <Button
                        type="button"
                        icon="pi pi-times"
                        text
                        rounded
                        severity="secondary"
                        className="lex-dialog-form-close"
                        aria-label="Fechar"
                        onClick={onClose}
                        disabled={saving}
                    />
                </header>

                {tabs && tabs.length > 0 && activeTab && onTabChange && (
                    <nav className="lex-dialog-form-tabs" role="tablist" aria-label="Seções">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                className={`lex-dialog-form-tab${activeTab === tab.id ? ' active' : ''}`}
                                onClick={() => onTabChange(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                )}

                <main className="lex-dialog-form-body lex-dialog-form-body--stack">{children}</main>

                <footer className="lex-dialog-form-footer">{footer}</footer>
            </div>
        </LexDialog>
    );
}
