import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { apiList } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import { parlamentaresApi, type Parliamentarian } from '../../api/legislative/parlamentares.api';
import type { CondicaoMandato, ParliamentarianUserStatus } from '../../types/parlamentares';
import { useAppToast } from '../../hooks/useAppToast';
import { DateRangePicker, Dropdown, FileUpload } from '../ui';
import { formatCpf, isValidCpf, normalizeCpf } from '../../utils/cpf';
import {
    PARLAMENTAR_PHOTO_ACCEPT,
    resolveParlamentarPhotoUrl,
} from './parlamentar-photo';

type Partido = { id: string; name: string; acronym: string };
type Legislatura = {
    id: string;
    number: number;
    isCurrent: boolean;
    startDate: string;
    endDate?: string;
};

const MIN_SENHA = 8;

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

export function ParlamentarCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);

    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [email, setEmail] = useState('');

    const [parliamentaryName, setParliamentaryName] = useState('');
    const [officeNumber, setOfficeNumber] = useState('');
    const [politicalPartyId, setPoliticalPartyId] = useState('');
    const [partidos, setPartidos] = useState<Partido[]>([]);

    const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
    const [legislaturaId, setLegislaturaId] = useState('');
    const [condicao, setCondicao] = useState<CondicaoMandato>('TITULAR');
    const [titulares, setTitulares] = useState<Parliamentarian[]>([]);
    const [titularAfastadoId, setTitularAfastadoId] = useState('');
    const [periodoMandato, setPeriodoMandato] = useState<[Date | null, Date | null]>([null, null]);
    const [statusAcesso, setStatusAcesso] = useState<ParliamentarianUserStatus>('ACTIVE');
    const [photoValue, setPhotoValue] = useState<File | string | null>(null);

    useEffect(() => {
        apiList<Legislatura>(API_PATHS.legislaturas, { limit: 50 })
            .then((r) => {
                setLegislaturas(r.data);
                const vigente = r.data.find((l) => l.isCurrent);
                if (vigente) setLegislaturaId(vigente.id);
            })
            .catch(() => setLegislaturas([]));

        apiList<Partido>(API_PATHS.partidosPoliticos, { limit: 100 })
            .then((r) => setPartidos(r.data))
            .catch(() => setPartidos([]));
    }, []);

    useEffect(() => {
        if (condicao !== 'SUPLENTE' || !legislaturaId) {
            setTitulares([]);
            setTitularAfastadoId('');
            return;
        }
        parlamentaresApi
            .list({ search: '', status: 'ACTIVE', limit: 100 })
            .then((r) => setTitulares(r.data))
            .catch(() => setTitulares([]));
    }, [condicao, legislaturaId]);

    const legislaturaSelecionada = useMemo(
        () => legislaturas.find((l) => l.id === legislaturaId),
        [legislaturas, legislaturaId],
    );

    useEffect(() => {
        if (!legislaturaSelecionada?.startDate) return;
        setPeriodoMandato([
            new Date(legislaturaSelecionada.startDate),
            legislaturaSelecionada.endDate
                ? new Date(legislaturaSelecionada.endDate)
                : null,
        ]);
    }, [legislaturaSelecionada]);

    const periodoMandatoValido = useMemo(() => {
        const [inicio, fim] = periodoMandato;
        if (!inicio) return true;
        if (fim && inicio.getTime() > fim.getTime()) return false;
        if (legislaturaSelecionada?.endDate) {
            const fimLegislatura = new Date(legislaturaSelecionada.endDate);
            if (inicio.getTime() > fimLegislatura.getTime()) return false;
        }
        return true;
    }, [periodoMandato, legislaturaSelecionada]);

    const cpfValido = isValidCpf(cpf);
    const senhaValida = senha.length >= MIN_SENHA;
    const senhasConferem = senha === confirmarSenha && confirmarSenha.length > 0;
    const emailValido = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const nomeValido = parliamentaryName.trim().length >= 3;

    const legislaturaOptions = useMemo(
        () => legislaturas.map((l) => ({ label: `Legislatura ${l.number}`, value: l.id })),
        [legislaturas],
    );

    const partidoOptions = useMemo(
        () => [
            { label: '— Sem partido —', value: '' },
            ...partidos.map((p) => ({ label: `${p.acronym} — ${p.name}`, value: p.id })),
        ],
        [partidos],
    );

    const titularesOptions = useMemo(
        () => titulares.map((p) => ({ label: p.parliamentaryName, value: p.id })),
        [titulares],
    );

    const canSubmit =
        cpfValido &&
        senhaValida &&
        senhasConferem &&
        emailValido &&
        nomeValido &&
        !!legislaturaId &&
        periodoMandatoValido;

    function handleCpfChange(raw: string) {
        const digits = normalizeCpf(raw).slice(0, 11);
        setCpf(formatCpf(digits));
    }

    async function handleSubmit() {
        if (!canSubmit) return;
        setSaving(true);
        try {
            const photoUrl = await resolveParlamentarPhotoUrl(photoValue);

            const created = await parlamentaresApi.create({
                cpf,
                password: senha,
                parliamentaryName: parliamentaryName.trim(),
                ...(email.trim() ? { email: email.trim().toLowerCase() } : {}),
                ...(officeNumber.trim() ? { officeNumber: officeNumber.trim() } : {}),
                ...(politicalPartyId ? { politicalPartyId } : {}),
                ...(photoUrl ? { photoUrl } : {}),
            });

            await parlamentaresApi.createMandato(created.id, {
                legislatureId: legislaturaId,
                ...(periodoMandato[0] ? { startedAt: periodoMandato[0].toISOString() } : {}),
            });

            if (statusAcesso === 'INACTIVE') {
                await parlamentaresApi.revokeAccess(created.id);
            }

            showSuccess(
                statusAcesso === 'ACTIVE'
                    ? `Parlamentar ${parliamentaryName.trim()} criado com acesso ao sistema.`
                    : `Parlamentar ${parliamentaryName.trim()} criado sem acesso ao sistema.`,
            );
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
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button
                label="Criar Parlamentar"
                icon="pi pi-check"
                loading={saving}
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Novo Parlamentar"
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(95vw, 680px)' }}
            footer={footer}
            modal
            className="sigl-dialog-parlamentar-create"
        >
            <div className="sigl-dialog-body sigl-dialog-body--dense">
            <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">
                        <i className="pi pi-calendar" aria-hidden />
                        Mandato
                    </span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-legislatura">Legislatura *</label>
                            <Dropdown
                                id="pc-legislatura"
                                options={legislaturaOptions}
                                value={legislaturaId || null}
                                onChange={(v) => setLegislaturaId(String(v))}
                                placeholder="Selecione a legislatura"
                                className="w-full"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <span className="sigl-field-label">Condição *</span>
                            <div className="sigl-radio-row sigl-radio-row--align-field">
                                <div className="flex align-items-center gap-2">
                                    <RadioButton
                                        inputId="pc-titular"
                                        name="pc-condicao"
                                        value="TITULAR"
                                        checked={condicao === 'TITULAR'}
                                        onChange={(e) => {
                                            setCondicao(e.value as CondicaoMandato);
                                            setTitularAfastadoId('');
                                        }}
                                    />
                                    <label htmlFor="pc-titular" className="sigl-radio-option-label">Titular</label>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <RadioButton
                                        inputId="pc-suplente"
                                        name="pc-condicao"
                                        value="SUPLENTE"
                                        checked={condicao === 'SUPLENTE'}
                                        onChange={(e) => setCondicao(e.value as CondicaoMandato)}
                                    />
                                    <label htmlFor="pc-suplente" className="sigl-radio-option-label">Suplente</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {condicao === 'SUPLENTE' && (
                        <div>
                            <Dropdown
                                id="pc-titular-afastado"
                                label="Titular afastado"
                                options={titularesOptions}
                                value={titularAfastadoId || null}
                                onChange={(v) => setTitularAfastadoId(String(v))}
                                placeholder={
                                    titularesOptions.length === 0
                                        ? 'Nenhum titular ativo encontrado'
                                        : 'Selecione o titular'
                                }
                                disabled={titularesOptions.length === 0}
                            />
                            <small className="text-color-secondary block mt-1">
                                Referência interna — vínculo de suplente será persistido em versão futura da API.
                            </small>
                        </div>
                    )}

                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <DateRangePicker
                                id="pc-periodo-mandato"
                                label="Período do mandato"
                                value={periodoMandato}
                                onChange={setPeriodoMandato}
                                placeholder="Início — Fim"
                                className="w-full"
                                error={
                                    !periodoMandatoValido
                                        ? 'Período inválido para a legislatura selecionada.'
                                        : undefined
                                }
                            />
                            <small className="text-color-secondary">
                                Fim previsto da legislatura
                                {legislaturaSelecionada ? ` ${legislaturaSelecionada.number}` : ''}.
                            </small>
                        </div>
                        <div className="sigl-filtro-campo">
                            <span className="sigl-field-label">Vínculo de acesso *</span>
                            <div className="sigl-radio-row sigl-radio-row--align-field">
                                <div className="flex align-items-center gap-2">
                                    <RadioButton
                                        inputId="pc-acesso-ativo"
                                        name="pc-acesso"
                                        value="ACTIVE"
                                        checked={statusAcesso === 'ACTIVE'}
                                        onChange={(e) =>
                                            setStatusAcesso(e.value as ParliamentarianUserStatus)
                                        }
                                    />
                                    <label htmlFor="pc-acesso-ativo" className="sigl-radio-option-label">
                                        Ativo
                                    </label>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <RadioButton
                                        inputId="pc-acesso-inativo"
                                        name="pc-acesso"
                                        value="INACTIVE"
                                        checked={statusAcesso === 'INACTIVE'}
                                        onChange={(e) =>
                                            setStatusAcesso(e.value as ParliamentarianUserStatus)
                                        }
                                    />
                                    <label htmlFor="pc-acesso-inativo" className="sigl-radio-option-label">
                                        Inativo
                                    </label>
                                </div>
                            </div>
                            <small className="text-color-secondary">
                                {statusAcesso === 'ACTIVE'
                                    ? 'Login com CPF e senha.'
                                    : 'Conta criada sem acesso ao SIGL.'}
                            </small>
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">
                        <i className="pi pi-user" aria-hidden />
                        Conta de acesso
                    </span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-cpf">CPF *</label>
                            <InputText
                                id="pc-cpf"
                                value={cpf}
                                onChange={(e) => handleCpfChange(e.target.value)}
                                placeholder="000.000.000-00"
                                className={`w-full${cpf && !cpfValido ? ' p-invalid' : ''}`}
                                inputMode="numeric"
                                autoComplete="off"
                            />
                            {cpf && !cpfValido && (
                                <small className="p-error">Informe um CPF com 11 dígitos.</small>
                            )}
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-email">E-mail</label>
                            <InputText
                                id="pc-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vereador@camara.gov.br"
                                className={`w-full${email && !emailValido ? ' p-invalid' : ''}`}
                                autoComplete="off"
                            />
                            <small className="text-color-secondary">
                                Opcional — se vazio, o sistema gera e-mail interno.
                            </small>
                        </div>
                    </div>

                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-senha">Senha *</label>
                            <input
                                id="pc-senha"
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className={`w-full${senha && !senhaValida ? ' p-invalid' : ''}`}
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {senha && !senhaValida && (
                                <small className="p-error">A senha deve ter ao menos {MIN_SENHA} caracteres.</small>
                            )}
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-confirmar-senha">Confirmar senha *</label>
                            <input
                                id="pc-confirmar-senha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                className={`w-full${confirmarSenha && !senhasConferem ? ' p-invalid' : ''}`}
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {confirmarSenha && !senhasConferem && (
                                <small className="p-error">As senhas não coincidem.</small>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">
                        <i className="pi pi-id-card" aria-hidden />
                        Identificação parlamentar
                    </span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pc-nome">Nome Parlamentar *</label>
                        <InputText
                            id="pc-nome"
                            value={parliamentaryName}
                            onChange={(e) => setParliamentaryName(e.target.value)}
                            placeholder="Nome de urna"
                            className={`w-full${parliamentaryName && !nomeValido ? ' p-invalid' : ''}`}
                        />
                        <small className="text-color-secondary">
                            Nome de urna usado nas proposições e documentos oficiais.
                        </small>
                    </div>
                    <div className="sigl-filtro-campo">
                        <FileUpload
                            id="pc-foto"
                            label="Foto do parlamentar"
                            accept={PARLAMENTAR_PHOTO_ACCEPT}
                            value={photoValue}
                            onChange={setPhotoValue}
                        />
                        <small className="text-color-secondary">
                            JPEG, PNG ou WebP · máx. 2 MB. Exibida na listagem e perfil.
                        </small>
                    </div>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <Dropdown
                            id="pc-partido"
                            label="Partido Político"
                            options={partidoOptions}
                            value={politicalPartyId}
                            onChange={(v) => setPoliticalPartyId(String(v))}
                            placeholder="Selecione (opcional)"
                        />
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pc-gabinete">Nº do Gabinete</label>
                            <InputText
                                id="pc-gabinete"
                                value={officeNumber}
                                onChange={(e) => setOfficeNumber(e.target.value)}
                                placeholder="Ex.: 31, 31A, Térreo"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
