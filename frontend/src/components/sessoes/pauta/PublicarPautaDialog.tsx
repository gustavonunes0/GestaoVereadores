import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';

interface Props {
    sessaoId: string;
    onClose: () => void;
    onPublicada: () => void;
}

export function PublicarPautaDialog({ sessaoId, onClose, onPublicada }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);

    async function confirmar() {
        setSaving(true);
        try {
            await sessoesApi.publicarPauta(sessaoId);
            showSuccess('Pauta publicada com sucesso.');
            onPublicada();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button label="Publicar pauta" icon="pi pi-send" loading={saving} onClick={() => void confirmar()} />
        </div>
    );

    return (
        <Dialog
            header="Publicar pauta"
            visible
            onHide={onClose}
            style={{ width: 'min(92vw, 460px)' }}
            footer={footer}
            modal
        >
            <ul className="m-0 pl-4 flex flex-column gap-2 text-sm">
                <li>Parlamentares verão a pauta publicada.</li>
                <li>Itens publicados <strong>não podem ser removidos</strong>.</li>
                <li>Novos itens ainda podem ser adicionados após a publicação.</li>
            </ul>
        </Dialog>
    );
}
