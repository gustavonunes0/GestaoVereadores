import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Password } from 'primereact/password';
import { authApi } from '../../api/client';
import { useAppToast } from '../../hooks/useAppToast';

const MIN_SENHA = 8;

type Props = {
    visible: boolean;
    onHide: () => void;
};

export function AlterarSenhaDialog({ visible, onHide }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const newPasswordValid = newPassword.length >= MIN_SENHA;
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const canSubmit =
        currentPassword.length > 0 && newPasswordValid && passwordsMatch && !saving;

    function resetForm() {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    function handleHide() {
        if (saving) return;
        resetForm();
        onHide();
    }

    async function handleSubmit() {
        if (!canSubmit) return;
        setSaving(true);
        try {
            await authApi.changePassword({
                currentPassword,
                newPassword,
            });
            showSuccess('Senha alterada com sucesso.');
            resetForm();
            onHide();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={handleHide} disabled={saving} />
            <Button
                label="Salvar senha"
                icon="pi pi-check"
                loading={saving}
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Alterar senha"
            visible={visible}
            onHide={handleHide}
            footer={footer}
            style={{ width: 'min(90vw, 440px)' }}
            modal
        >
            <div className="sigl-dialog-body">
                <p className="m-0 mb-3 text-color-secondary text-sm">
                    Informe a senha atual e escolha uma nova senha com ao menos {MIN_SENHA}{' '}
                    caracteres.
                </p>
                <div className="sigl-dialog-grid sigl-dialog-grid-1">
                    <div className="sigl-filtro-campo">
                        <label htmlFor="senha-atual">Senha atual *</label>
                        <Password
                            id="senha-atual"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            toggleMask
                            feedback={false}
                            className="w-full"
                            inputClassName="w-full"
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="senha-nova">Nova senha *</label>
                        <Password
                            id="senha-nova"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            toggleMask
                            feedback={false}
                            className={`w-full${newPassword && !newPasswordValid ? ' p-invalid' : ''}`}
                            inputClassName="w-full"
                            autoComplete="new-password"
                        />
                        {newPassword && !newPasswordValid ? (
                            <small className="p-error">
                                Mínimo de {MIN_SENHA} caracteres
                            </small>
                        ) : null}
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="senha-confirm">Confirmar nova senha *</label>
                        <Password
                            id="senha-confirm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            toggleMask
                            feedback={false}
                            className={`w-full${confirmPassword && !passwordsMatch ? ' p-invalid' : ''}`}
                            inputClassName="w-full"
                            autoComplete="new-password"
                        />
                        {confirmPassword && !passwordsMatch ? (
                            <small className="p-error">As senhas não coincidem</small>
                        ) : null}
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
