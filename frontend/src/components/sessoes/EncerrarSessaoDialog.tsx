import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    sessaoId: string;
    onClose: () => void;
    onSaved: () => void;
}

export function EncerrarSessaoDialog({ sessaoId, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setLoading] = useState(false);
    const [observacoes, setObservacoes] = useState('');

    async function handleConfirmar() {
        setLoading(true);
        try {
            await sessoesApi.encerrar(sessaoId);
            showSuccess('Sessão encerrada.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Encerrar Sessão"
                icon="pi pi-stop"
                severity="warning"
                loading={loading}
                onClick={() => void handleConfirmar()}
            />
        </div>
    );

    return (
        <Dialog
            header="Encerrar Sessão Plenária"
            visible
            onHide={onClose}
            style={{ width: '420px' }}
            footer={footer}
            modal
        >
            <Message
                severity="warn"
                text="Ao encerrar, a pauta será fechada automaticamente e nenhum novo voto poderá ser registrado."
                className="w-full mb-3"
            />
            <div className="p-fluid">
                <label htmlFor="enc-obs">Observações (opcional)</label>
                <InputTextarea
                    id="enc-obs"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    autoResize
                />
            </div>
        </Dialog>
    );
}
