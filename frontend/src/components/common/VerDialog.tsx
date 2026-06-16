import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

interface VerDialogProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export function VerDialog({ visible, title, onClose, children }: VerDialogProps) {
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
            style={{ width: 'min(90vw, 700px)' }}
            footer={footer}
        >
            {children}
        </Dialog>
    );
}
