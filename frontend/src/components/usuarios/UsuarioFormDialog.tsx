import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import {
    usuariosApi,
    type ConvidarUsuarioInput,
    type TenantStaffRole,
    type TenantStaffUser,
    type UpdateUsuarioInput,
} from '../../api/usuarios.api';
import { Dropdown } from '../ui';
import { useAppToast } from '../../hooks/useAppToast';
import { isValidCpf, normalizeCpf } from '../../utils/cpf';

const ROLE_OPTIONS: { label: string; value: TenantStaffRole }[] = [
    { label: 'Administrador', value: 'ADMIN_STAFF' },
    { label: 'Operador', value: 'STAFF' },
];

type Props =
    | {
          mode: 'create';
          onClose: () => void;
          onSaved: () => void;
      }
    | {
          mode: 'edit';
          usuario: TenantStaffUser;
          onClose: () => void;
          onSaved: () => void;
      };

function isValidEmail(value: string) {
    if (!value.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function UsuarioFormDialog(props: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const isEdit = props.mode === 'edit';
    const [loading, setLoading] = useState(false);

    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TenantStaffRole>('STAFF');
    const [ativo, setAtivo] = useState(true);

    useEffect(() => {
        if (!isEdit) return;
        setNome(props.usuario.nome);
        setEmail(props.usuario.email);
        setRole(props.usuario.role);
        setAtivo(props.usuario.ativo);
    }, [isEdit, props]);

    const cpfValid = isEdit || isValidCpf(cpf);
    const emailValid = isValidEmail(email);
    const passwordValid = isEdit || password.length >= 8;
    const passwordsMatch =
        isEdit || (password.length > 0 && password === confirmPassword);

    const canSubmit = useMemo(() => {
        if (!nome.trim() || !emailValid) return false;
        if (!isEdit && (!cpfValid || !passwordValid || !passwordsMatch)) return false;
        return true;
    }, [
        nome,
        emailValid,
        isEdit,
        cpfValid,
        passwordValid,
        passwordsMatch,
    ]);

    async function handleSubmit() {
        if (!canSubmit) return;
        setLoading(true);
        try {
            if (isEdit) {
                const body: UpdateUsuarioInput = {
                    nome: nome.trim(),
                    role,
                    ativo,
                };
                await usuariosApi.update(props.usuario.id, body);
                showSuccess('Usuário atualizado com sucesso.');
            } else {
                const body: ConvidarUsuarioInput = {
                    cpf: normalizeCpf(cpf),
                    password,
                    nome: nome.trim(),
                    role,
                    ...(email.trim() ? { email: email.trim() } : {}),
                };
                await usuariosApi.convidar(body);
                showSuccess('Usuário criado com sucesso.');
            }
            props.onSaved();
            props.onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancelar"
                severity="secondary"
                onClick={props.onClose}
                disabled={loading}
            />
            <Button
                label={isEdit ? 'Salvar' : 'Criar'}
                icon="pi pi-check"
                loading={loading}
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={isEdit ? `Editar — ${props.usuario.nome}` : 'Novo usuário'}
            visible
            onHide={props.onClose}
            style={{ width: 'min(90vw, 560px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Acesso</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        {!isEdit ? (
                            <>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="usr-cpf">CPF *</label>
                                    <InputMask
                                        id="usr-cpf"
                                        mask="999.999.999-99"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.value ?? '')}
                                        className="w-full"
                                    />
                                </div>
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="usr-senha">Senha *</label>
                                    <Password
                                        id="usr-senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        toggleMask
                                        feedback={false}
                                        className={`w-full${password && !passwordValid ? ' p-invalid' : ''}`}
                                        inputClassName="w-full"
                                    />
                                    {password && !passwordValid ? (
                                        <small className="p-error">
                                            Mínimo de 8 caracteres
                                        </small>
                                    ) : null}
                                </div>
                                <div className="sigl-filtro-campo sigl-col-full">
                                    <label htmlFor="usr-confirm">Confirmar senha *</label>
                                    <Password
                                        id="usr-confirm"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        toggleMask
                                        feedback={false}
                                        className={`w-full${confirmPassword && !passwordsMatch ? ' p-invalid' : ''}`}
                                        inputClassName="w-full"
                                    />
                                    {confirmPassword && !passwordsMatch ? (
                                        <small className="p-error">
                                            As senhas não coincidem
                                        </small>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="sigl-filtro-campo sigl-col-full">
                                <label>CPF</label>
                                <InputText
                                    value={props.usuario.cpf}
                                    readOnly
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Perfil</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="usr-nome">Nome exibido *</label>
                            <InputText
                                id="usr-nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="usr-role">Perfil *</label>
                            <Dropdown
                                id="usr-role"
                                value={role}
                                options={ROLE_OPTIONS}
                                onChange={(v) => setRole(v as TenantStaffRole)}
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="usr-email">E-mail</label>
                            <InputText
                                id="usr-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vereador@camara.gov.br"
                                readOnly={isEdit}
                                className={`w-full${email && !emailValid ? ' p-invalid' : ''}`}
                            />
                            {email && !emailValid ? (
                                <small className="p-error">E-mail inválido</small>
                            ) : null}
                        </div>
                        {isEdit ? (
                            <div className="sigl-filtro-campo sigl-col-full flex align-items-center gap-2">
                                <input
                                    id="usr-ativo"
                                    type="checkbox"
                                    checked={ativo}
                                    onChange={(e) => setAtivo(e.target.checked)}
                                />
                                <label htmlFor="usr-ativo">Usuário ativo</label>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
