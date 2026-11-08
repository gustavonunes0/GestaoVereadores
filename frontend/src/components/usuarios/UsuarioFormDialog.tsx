import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
} from '../../api/user-manager.api';
import { Dropdown } from '../ui';
import { useAppToast } from '../../hooks/useAppToast';
import { formatCpf, isValidCpf, normalizeCpf } from '../../utils/cpf';

const ROLE_OPTIONS: { label: string; value: TenantStaffRole }[] = [
    { label: 'Administrador', value: 'ADMIN_STAFF' },
    { label: 'Operador', value: 'STAFF' },
    { label: 'Secretária Legislativa', value: 'SECRETARIA_LEGISLATIVA' },
];

const MIN_SENHA = 8;

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

function buildInternalEmail(cpfDigits: string) {
    const digits = cpfDigits.replace(/\D/g, '');
    if (digits.length !== 11) return '';
    return `staff.${digits}@interno.sigl.local`;
}

function FieldLabel({
    htmlFor,
    children,
    required,
    meta,
}: {
    htmlFor?: string;
    children: ReactNode;
    required?: boolean;
    meta?: ReactNode;
}) {
    return (
        <div className="usr-field-label-row">
            <label htmlFor={htmlFor} className="sigl-field-label">
                {children}
                {required ? <span className="usr-required"> *</span> : null}
            </label>
            {meta ? <span className="usr-field-meta">{meta}</span> : null}
        </div>
    );
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
        setPassword('');
        setConfirmPassword('');
    }, [isEdit, props]);

    const cpfDigits = isEdit ? props.usuario.cpf : normalizeCpf(cpf);
    const cpfValid = isEdit || isValidCpf(cpf);
    const emailValid = isValidEmail(email);
    const passwordFilled = password.length > 0;
    const passwordValid = isEdit
        ? !passwordFilled || password.length >= MIN_SENHA
        : password.length >= MIN_SENHA;
    const passwordsMatch = isEdit
        ? !passwordFilled ||
          (password === confirmPassword && confirmPassword.length > 0)
        : password.length > 0 && password === confirmPassword;

    const previewInternalEmail = useMemo(() => {
        if (isEdit) return props.usuario.email;
        if (email.trim()) return email.trim().toLowerCase();
        return buildInternalEmail(cpfDigits);
    }, [isEdit, props, email, cpfDigits]);

    const canSubmit = useMemo(() => {
        if (!nome.trim() || !emailValid) return false;
        if (!passwordValid || !passwordsMatch) return false;
        if (!isEdit && !cpfValid) return false;
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
                    ...(passwordFilled ? { password } : {}),
                };
                await usuariosApi.update(props.usuario.id, body);
                showSuccess('Usuário atualizado com sucesso.');
            } else {
                const body: ConvidarUsuarioInput = {
                    cpf: cpfDigits,
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
                text
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
            style={{ width: 'min(92vw, 520px)' }}
            footer={footer}
            modal
            className="usr-form-dialog"
        >
            <div className="sigl-dialog-body sigl-dialog-body--dense">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Acesso</span>
                    <div className="sigl-dialog-grid">
                        <div className="sigl-filtro-campo sigl-col-full">
                            <FieldLabel
                                htmlFor={isEdit ? undefined : 'usr-cpf'}
                                required={!isEdit}
                                meta={
                                    isEdit ? (
                                        <>
                                            <i className="pi pi-lock" aria-hidden />
                                            Identificador fixo
                                        </>
                                    ) : cpfValid ? (
                                        <>
                                            <i className="pi pi-check-circle" aria-hidden />
                                            Pronto para cadastro
                                        </>
                                    ) : (
                                        'Login por CPF'
                                    )
                                }
                            >
                                CPF
                            </FieldLabel>
                            {isEdit ? (
                                <div className="usr-input-with-badge">
                                    <InputText
                                        value={formatCpf(props.usuario.cpf)}
                                        readOnly
                                        className="w-full"
                                    />
                                    <span className="usr-verified-badge">
                                        <i className="pi pi-verified" aria-hidden />
                                        Verificado
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className={`usr-input-with-badge${cpfValid ? ' is-verified' : ''}`}
                                >
                                    <InputMask
                                        id="usr-cpf"
                                        mask="999.999.999-99"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.value ?? '')}
                                        className="w-full"
                                        autoClear={false}
                                    />
                                    {cpfValid ? (
                                        <span className="usr-verified-badge">
                                            <i className="pi pi-verified" aria-hidden />
                                            Verificado
                                        </span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        <div className="sigl-filtro-campo sigl-col-full">
                            <FieldLabel
                                htmlFor="usr-senha"
                                required={!isEdit}
                            >
                                {isEdit ? 'Nova senha' : 'Senha'}
                            </FieldLabel>
                            <Password
                                id="usr-senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                toggleMask
                                feedback={false}
                                className={`w-full${passwordFilled && !passwordValid ? ' p-invalid' : ''}`}
                                inputClassName="w-full"
                                autoComplete="new-password"
                            />
                            {passwordFilled && !passwordValid ? (
                                <small className="p-error">
                                    Mínimo de {MIN_SENHA} caracteres
                                </small>
                            ) : null}
                        </div>

                        <div className="sigl-filtro-campo sigl-col-full">
                            <FieldLabel
                                htmlFor="usr-confirm"
                                required={!isEdit || passwordFilled}
                            >
                                {isEdit ? 'Confirmar nova senha' : 'Confirmar senha'}
                            </FieldLabel>
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
                                autoComplete="new-password"
                            />
                            {confirmPassword && !passwordsMatch ? (
                                <small className="p-error">
                                    As senhas não coincidem
                                </small>
                            ) : isEdit ? (
                                <small className="text-color-secondary">
                                    Deixe em branco para manter a senha atual
                                </small>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Perfil</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <FieldLabel htmlFor="usr-nome" required>
                                Nome exibido
                            </FieldLabel>
                            <InputText
                                id="usr-nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full"
                                placeholder="Ex.: Romero Silva"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <FieldLabel htmlFor="usr-role" required>
                                Perfil
                            </FieldLabel>
                            <Dropdown
                                id="usr-role"
                                value={role}
                                options={ROLE_OPTIONS}
                                onChange={(v) => setRole(v as TenantStaffRole)}
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <FieldLabel
                                htmlFor="usr-email"
                                meta={
                                    isEdit || !email.trim() ? (
                                        <>
                                            <i className="pi pi-building" aria-hidden />
                                            Endereço corporativo interno
                                        </>
                                    ) : (
                                        'E-mail informado'
                                    )
                                }
                            >
                                E-mail
                            </FieldLabel>
                            {isEdit ? (
                                <InputText
                                    id="usr-email"
                                    value={email}
                                    readOnly
                                    className="w-full"
                                />
                            ) : (
                                <>
                                    <InputText
                                        id="usr-email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={
                                            previewInternalEmail ||
                                            'Opcional — gera automático pelo CPF'
                                        }
                                        className={`w-full${email && !emailValid ? ' p-invalid' : ''}`}
                                    />
                                    {email && !emailValid ? (
                                        <small className="p-error">
                                            E-mail inválido
                                        </small>
                                    ) : previewInternalEmail && !email.trim() ? (
                                        <small className="text-color-secondary">
                                            Será usado: {previewInternalEmail}
                                        </small>
                                    ) : null}
                                </>
                            )}
                        </div>
                        {isEdit ? (
                            <div className="sigl-filtro-campo sigl-col-full">
                                <label
                                    htmlFor="usr-ativo"
                                    className="usr-ativo-row"
                                >
                                    <input
                                        id="usr-ativo"
                                        type="checkbox"
                                        checked={ativo}
                                        onChange={(e) =>
                                            setAtivo(e.target.checked)
                                        }
                                    />
                                    <span>
                                        <span className="usr-ativo-title">
                                            Usuário ativo
                                        </span>
                                        <small className="text-color-secondary block">
                                            Habilita autenticação e permissões
                                            imediatas
                                        </small>
                                    </span>
                                </label>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
