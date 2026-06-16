import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import type { QuorumInfo } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    sessaoId: string;
    onClose: () => void;
    onSaved: () => void;
}

export function AbrirSessaoDialog({ sessaoId, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [loading, setSaving] = useState(false);
    const [quorum, setQuorum] = useState<QuorumInfo | null>(null);
    const [loadingQuorum, setLoadingQuorum] = useState(true);
    const [observacoes, setObservacoes] = useState('');

    useEffect(() => {
        sessoesApi
            .getQuorum(sessaoId)
            .then(setQuorum)
            .catch(() => setQuorum(null))
            .finally(() => setLoadingQuorum(false));
    }, [sessaoId]);

    async function handleConfirmar() {
        setSaving(true);
        try {
            await sessoesApi.abrir(sessaoId);
            showSuccess('Sessão aberta com sucesso.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Abrir Sessão"
                icon="pi pi-play"
                loading={loading}
                onClick={() => void handleConfirmar()}
            />
        </div>
    );

    return (
        <Dialog
            header="Abrir Sessão Plenária"
            visible
            onHide={onClose}
            style={{ width: '420px' }}
            footer={footer}
            modal
        >
            {loadingQuorum ? (
                <div className="flex justify-content-center py-3">
                    <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
                </div>
            ) : quorum ? (
                <Message
                    severity={quorum.temQuorum ? 'success' : 'warn'}
                    text={`Quórum mínimo: ${quorum.minimo} — Presentes: ${quorum.presente} — ${quorum.temQuorum ? '✅ Tem quórum' : '⚠️ Sem quórum'}`}
                    className="w-full mb-3"
                />
            ) : null}

            {quorum && !quorum.temQuorum && (
                <p className="text-sm text-color-secondary mb-3">
                    Atenção: a sessão pode ser aberta mesmo sem quórum, mas o backend pode rejeitar dependendo da configuração.
                </p>
            )}

            <div className="p-fluid">
                <label htmlFor="abrir-obs">Observações (opcional)</label>
                <InputTextarea
                    id="abrir-obs"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={2}
                    autoResize
                />
            </div>
        </Dialog>
    );
}
