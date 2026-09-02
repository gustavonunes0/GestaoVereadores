import { useState } from 'react';
import { LexDialog } from '../ui/LexDialog';
import { LexDialogFooter } from '../ui/LexDialogFooter';
import { useAppToast } from '../../hooks/useAppToast';

interface DeleteDialogProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export function DeleteDialog({ visible, title, message, onConfirm, onClose }: DeleteDialogProps) {
    const [loading, setLoading] = useState(false);
    const { showSuccess, showApiError } = useAppToast();

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            showSuccess('Registro excluído com sucesso');
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LexDialog
            header={title}
            visible={visible}
            variant="danger"
            onHide={onClose}
            style={{ width: 'min(96vw, 28rem)' }}
            footer={
                <LexDialogFooter
                    onCancel={onClose}
                    onConfirm={() => void handleConfirm()}
                    confirmLabel="Excluir"
                    confirmIcon="pi pi-trash"
                    confirmSeverity="danger"
                    loading={loading}
                    cancelDisabled={loading}
                />
            }
        >
            <p className="m-0">{message}</p>
        </LexDialog>
    );
}
