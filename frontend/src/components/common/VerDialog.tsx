import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

interface VerDialogProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
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
    const footer = (
        <div className="flex justify-content-end">
            <Button label="Fechar" icon="pi pi-times" severity="secondary" onClick={onClose} />
        </div>
    );

    return (
        <Dialog
            header={title}
            visible={visible}
            onHide={onClose}
            style={{ width }}
            className={contentClassName}
            footer={footer}
        >
            {children}
        </Dialog>
    );
}
