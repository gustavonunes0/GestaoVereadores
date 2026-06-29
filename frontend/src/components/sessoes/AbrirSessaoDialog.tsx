import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
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
    const [modoTeste, setModoTeste] = useState(false);

    useEffect(() => {
        sessoesApi
            .getQuorum(sessaoId)
            .then(setQuorum)
            .catch(() => setQuorum(null))
            .finally(() => setLoadingQuorum(false));
    }, [sessaoId]);

    const podeAbrir = modoTeste
        ? (quorum?.presente ?? 0) >= 1
        : quorum?.temQuorum ?? false;

    async function handleConfirmar() {
        setSaving(true);
        try {
            await sessoesApi.abrir(sessaoId, {
                observacao: observacoes.trim() || undefined,
                modoTeste,
            });
            showSuccess(
                modoTeste
                    ? 'Sessão de teste aberta com sucesso.'
                    : 'Sessão aberta com sucesso.',
            );
            onSaved();
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.includes('ABERTA → ABERTA') || msg.includes('ABERTA -> ABERTA')) {
                showApiError(new Error('Esta sessão já está aberta. Atualize a página.'));
                onSaved();
                onClose();
                return;
            }
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label={modoTeste ? 'Abrir sessão de teste' : 'Abrir Sessão'}
                icon="pi pi-play"
                loading={loading}
                disabled={loadingQuorum || !podeAbrir}
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
            <div className="sigl-dialog-body">
                {loadingQuorum ? (
                    <div className="flex justify-content-center py-3">
                        <ProgressSpinner style={{ width: '2rem', height: '2rem' }} />
                    </div>
                ) : quorum ? (
                    <Message
                        severity={modoTeste || quorum.temQuorum ? 'success' : 'warn'}
                        text={
                            modoTeste
                                ? `Modo teste: mínimo 1 presente — Presentes: ${quorum.presente}`
                                : `Quórum mínimo: ${quorum.minimo} — Presentes: ${quorum.presente} — ${quorum.temQuorum ? '✅ Tem quórum' : '⚠️ Sem quórum'}`
                        }
                        className="w-full"
                    />
                ) : null}

                <div className="flex align-items-start gap-2 mt-3">
                    <Checkbox
                        inputId="abrir-modo-teste"
                        checked={modoTeste}
                        onChange={(e) => setModoTeste(e.checked === true)}
                    />
                    <label htmlFor="abrir-modo-teste" className="cursor-pointer">
                        <span className="font-medium block">Sessão de teste</span>
                        <span className="text-sm text-color-secondary">
                            Dispensa o quórum completo. Basta 1 parlamentar presente para abrir e
                            votar.
                        </span>
                    </label>
                </div>

                {modoTeste && quorum && quorum.presente < 1 && (
                    <Message
                        severity="warn"
                        text="Marque ao menos 1 parlamentar como presente antes de abrir."
                        className="w-full mt-2"
                    />
                )}

                {!modoTeste && quorum && !quorum.temQuorum && (
                    <p className="text-sm text-color-secondary m-0 mt-2">
                        Marque mais parlamentares como presentes ou use a opção de sessão de teste.
                    </p>
                )}

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Observações</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="abrir-obs">Observações (opcional)</label>
                        <InputTextarea
                            id="abrir-obs"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={2}
                            autoResize
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
