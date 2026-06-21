import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { apiList } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import {
    parlamentaresApi,
    type Parliamentarian,
    type ParlamentarMandato,
} from '../../api/legislative/parlamentares.api';
import type { CondicaoMandato, ParliamentarianUserStatus } from '../../types/parlamentares';
import { useAppToast } from '../../hooks/useAppToast';
import { DateRangePicker, Dropdown, FileUpload } from '../ui';
import { formatCpf } from '../../utils/cpf';
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

interface Props {
    parlamentarianId: string;
    parlamentar: Parliamentarian;
    mandatos: ParlamentarMandato[];
    onClose: () => void;
    onSaved: () => void;
}

export function ParlamentarEditDialog({
    parlamentarianId,
    parlamentar,
    mandatos,
    onClose,
    onSaved,
}: Props) {
    const { showSuccess, showApiError, confirmDestructive } = useAppToast();
    const [saving, setSaving] = useState(false);

    const mandatoAtivo = useMemo(
        () => mandatos.find((m) => m.status === 'ACTIVE') ?? mandatos[0],
        [mandatos],
    );

    const wasAccessActive =
        parlamentar.accessStatus === 'ACTIVE' || parlamentar.hasAccess;

    const [parliamentaryName, setParliamentaryName] = useState(parlamentar.parliamentaryName);
    const [officeNumber, setOfficeNumber] = useState(parlamentar.officeNumber ?? '');
    const [politicalPartyId, setPoliticalPartyId] = useState(
        parlamentar.user?.politicalParty?.id ?? '',
    );
    const [photoValue, setPhotoValue] = useState<File | string | null>(
        parlamentar.photoUrl ?? null,
    );
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
    const [legislaturaId, setLegislaturaId] = useState(mandatoAtivo?.legislatureId ?? '');
    const [condicao] = useState<CondicaoMandato>('TITULAR');
    const [periodoMandato, setPeriodoMandato] = useState<[Date | null, Date | null]>([null, null]);

    useEffect(() => {
        if (!mandatoAtivo) {
            setPeriodoMandato([null, null]);
            return;
        }

        const legislaturaMandato = legislaturas.find((l) => l.id === mandatoAtivo.legislatureId);
        const inicio = mandatoAtivo.startedAt ? new Date(mandatoAtivo.startedAt) : null;
        const fim = mandatoAtivo.endedAt
            ? new Date(mandatoAtivo.endedAt)
            : legislaturaMandato?.endDate
              ? new Date(legislaturaMandato.endDate)
              : mandatoAtivo.legislature.endDate
                ? new Date(mandatoAtivo.legislature.endDate)
                : null;

        setPeriodoMandato([inicio, fim]);
    }, [mandatoAtivo, legislaturas]);
    const [statusAcesso, setStatusAcesso] = useState<ParliamentarianUserStatus>(
        wasAccessActive ? 'ACTIVE' : 'INACTIVE',
    );

    useEffect(() => {
        apiList<Legislatura>(API_PATHS.legislaturas, { limit: 50 })
            .then((r) => setLegislaturas(r.data))
            .catch(() => setLegislaturas([]));

        apiList<Partido>(API_PATHS.partidosPoliticos, { limit: 100 })
            .then((r) => setPartidos(r.data))
            .catch(() => setPartidos([]));
    }, []);

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

    const handleStatusAcessoChange = (value: ParliamentarianUserStatus) => {
        if (value === 'INACTIVE' && wasAccessActive) {
            confirmDestructive(
                'Desativar remove o acesso do parlamentar ao sistema. Deseja continuar?',
                () => setStatusAcesso('INACTIVE'),
                'Desativar acesso',
            );
            return;
        }
        setStatusAcesso(value);
    };

    async function handleSubmit() {
        if (!nomeValido) return;
        setSaving(true);
        try {
            const photoUrl = await resolveParlamentarPhotoUrl(
                photoValue,
                parlamentar.photoUrl,
            );

            await parlamentaresApi.update(parlamentarianId, {
                parliamentaryName: parliamentaryName.trim(),
                officeNumber: officeNumber.trim() || undefined,
                ...(parlamentar.user
                    ? { politicalPartyId: politicalPartyId || null }
                    : {}),
                ...(photoUrl !== undefined
                    ? { photoUrl: photoUrl === null ? '' : photoUrl }
                    : {}),
            });

            if (parlamentar.user) {
                if (statusAcesso === 'ACTIVE' && !wasAccessActive) {
                    await parlamentaresApi.grantAccess(parlamentarianId, {
                        userId: parlamentar.user.id,
                    });
                } else if (statusAcesso === 'INACTIVE' && wasAccessActive) {
                    await parlamentaresApi.revokeAccess(parlamentarianId);
                }
            }

            showSuccess('Parlamentar atualizado com sucesso.');
            onSaved();
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
                label="Salvar"
                icon="pi pi-check"
                loading={saving}
                disabled={!nomeValido}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={`Editar — ${parlamentar.parliamentaryName}`}
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
                        <i className="pi pi-user" aria-hidden />
                        Conta de acesso
                    </span>
                    {parlamentar.user ? (
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="pe-cpf">CPF</label>
                                <InputText
                                    id="pe-cpf"
                                    value={formatCpf(parlamentar.user.cpf)}
                                    disabled
                                    className="w-full"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="pe-email">E-mail</label>
                                <InputText
                                    id="pe-email"
                                    value={parlamentar.user.email}
                                    disabled
                                    className="w-full"
                                />
                                <small className="text-color-secondary">
                                    CPF e e-mail não podem ser alterados nesta tela.
                                </small>
                            </div>
                        </div>
                    ) : (
                        <p className="text-color-secondary m-0">
                            Nenhum usuário vinculado. O acesso ao SIGL não está configurado.
                        </p>
                    )}
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">
                        <i className="pi pi-id-card" aria-hidden />
                        Identificação parlamentar
                    </span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pe-nome">Nome Parlamentar *</label>
                        <InputText
                            id="pe-nome"
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
                            id="pe-foto"
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
                        {parlamentar.user && (
                            <Dropdown
                                id="pe-partido"
                                label="Partido Político"
                                options={partidoOptions}
                                value={politicalPartyId}
                                onChange={(v) => setPoliticalPartyId(String(v))}
                                placeholder="Selecione (opcional)"
                            />
                        )}
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pe-gabinete">Nº do Gabinete</label>
                            <InputText
                                id="pe-gabinete"
                                value={officeNumber}
                                onChange={(e) => setOfficeNumber(e.target.value)}
                                placeholder="Ex.: 31, 31A, Térreo"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {mandatoAtivo && (
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">
                            <i className="pi pi-calendar" aria-hidden />
                            Mandato
                        </span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="pe-legislatura">Legislatura</label>
                                <Dropdown
                                    id="pe-legislatura"
                                    options={legislaturaOptions}
                                    value={legislaturaId || null}
                                    onChange={(v) => setLegislaturaId(String(v))}
                                    placeholder="Legislatura do mandato"
                                    className="w-full"
                                    disabled
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <span className="sigl-field-label">Condição</span>
                                <div className="sigl-radio-row sigl-radio-row--align-field">
                                    <div className="flex align-items-center gap-2">
                                        <RadioButton
                                            inputId="pe-titular"
                                            value="TITULAR"
                                            checked={condicao === 'TITULAR'}
                                            disabled
                                        />
                                        <label htmlFor="pe-titular" className="sigl-radio-option-label">
                                            Titular
                                        </label>
                                    </div>
                                    <div className="flex align-items-center gap-2">
                                        <RadioButton
                                            inputId="pe-suplente"
                                            value="SUPLENTE"
                                            checked={condicao === 'SUPLENTE'}
                                            disabled
                                        />
                                        <label htmlFor="pe-suplente" className="sigl-radio-option-label">
                                            Suplente
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <DateRangePicker
                                    id="pe-periodo-mandato"
                                    label="Período do mandato"
                                    value={periodoMandato}
                                    onChange={() => {}}
                                    placeholder="Início — Fim"
                                    className="w-full"
                                    disabled
                                />
                                <small className="text-color-secondary">
                                    Período vinculado ao mandato ativo. Alterações pela gestão de mandatos.
                                </small>
                            </div>
                            {parlamentar.user && (
                                <div className="sigl-filtro-campo">
                                    <span className="sigl-field-label">Vínculo de acesso *</span>
                                    <div className="sigl-radio-row sigl-radio-row--align-field">
                                        <div className="flex align-items-center gap-2">
                                            <RadioButton
                                                inputId="pe-acesso-ativo"
                                                name="pe-acesso"
                                                value="ACTIVE"
                                                checked={statusAcesso === 'ACTIVE'}
                                                onChange={(e) =>
                                                    handleStatusAcessoChange(
                                                        e.value as ParliamentarianUserStatus,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="pe-acesso-ativo"
                                                className="sigl-radio-option-label"
                                            >
                                                Ativo
                                            </label>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <RadioButton
                                                inputId="pe-acesso-inativo"
                                                name="pe-acesso"
                                                value="INACTIVE"
                                                checked={statusAcesso === 'INACTIVE'}
                                                onChange={(e) =>
                                                    handleStatusAcessoChange(
                                                        e.value as ParliamentarianUserStatus,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="pe-acesso-inativo"
                                                className="sigl-radio-option-label"
                                            >
                                                Inativo
                                            </label>
                                        </div>
                                    </div>
                                    <small className="text-color-secondary">
                                        {statusAcesso === 'ACTIVE'
                                            ? 'Login com CPF e senha.'
                                            : 'Conta mantida sem acesso ao SIGL.'}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
}
