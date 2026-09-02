import type { ReactNode } from 'react';
import { Button } from 'primereact/button';
import { LexDialog } from '../ui/LexDialog';

interface VerDialogProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
    width?: string;
    contentClassName?: string;
}

export function VerDialog({
    visible,
    title,
    onClose,
    children,
    width = 'min(90vw, 700px)',
    contentClassName,
}: VerDialogProps) {
    return (
        <LexDialog
            header={title}
            visible={visible}
            variant="view"
            onHide={onClose}
            style={{ width }}
            className={contentClassName}
            footer={
                <div className="lex-dialog-actions">
                    <Button
                        label="Fechar"
                        icon="pi pi-times"
                        severity="secondary"
                        text
                        onClick={onClose}
                    />
                </div>
            }
        >
            {children}
        </LexDialog>
    );
}
