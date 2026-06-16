import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
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
        <Dialog
            header={title}
            visible={visible}
            onHide={onClose}
            style={{ width: '400px' }}
        >
            <p>{message}</p>
            <div className="flex justify-content-end gap-2 mt-3">
                <Button
                    label="Cancelar"
                    severity="secondary"
                    onClick={onClose}
                    disabled={loading}
                />
                <Button
                    label="Excluir"
                    severity="danger"
                    icon="pi pi-trash"
                    onClick={handleConfirm}
                    loading={loading}
                />
            </div>
        </Dialog>
    );
}
