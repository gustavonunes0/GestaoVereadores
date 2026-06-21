import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown as PrDropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Tag } from 'primereact/tag';
import { apiList } from '../../api/client';
import { API_PATHS } from '../../api/paths';
import { parlamentaresApi, type Parliamentarian } from '../../api/legislative/parlamentares.api';
import type {
    ParlamentarianUser,
    UserResumo,
    CondicaoMandato,
    CreateParlamentarianUserDto,
} from '../../types/parlamentares';
import { useAppToast } from '../../hooks/useAppToast';
import { UserSearchField } from './UserSearchField';

type Partido = { id: string; name: string; acronym: string };
type Legislatura = { id: string; number: number; isCurrent: boolean };

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Ativo', INACTIVE: 'Inativo' };
const STATUS_SEV: Record<string, 'success' | 'secondary'> = { ACTIVE: 'success', INACTIVE: 'secondary' };

interface Props {
    parlamentarianId: string;
    activeUserName: string;
    existingUsers: ParlamentarianUser[];
    onClose: () => void;
    onSaved: () => void;
}

export function ParlamentarVincularDialog({
    parlamentarianId,
    activeUserName,
    existingUsers,
    onClose,
    onSaved,
}: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);

    const [user, setUser] = useState<UserResumo | null>(null);
    const [parliamentaryName, setParliamentaryName] = useState('');
    const [officeNumber, setOfficeNumber] = useState('');
    const [politicalPartyId, setPoliticalPartyId] = useState('');
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [legislaturas, setLegislaturas] = useState<Legislatura[]>([]);
    const [legislaturaId, setLegislaturaId] = useState('');
    const [condicao, setCondicao] = useState<CondicaoMandato>('TITULAR');
    const [titulares, setTitulares] = useState<Parliamentarian[]>([]);
    const [titularAfastadoId, setTitularAfastadoId] = useState('');
    const [dataPosse, setDataPosse] = useState<Date | null>(null);

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
            .list({ legislaturaId, condicao: 'TITULAR', status: 'ACTIVE', limit: 100 })
            .then((r) => setTitulares(r.data))
            .catch(() => setTitulares([]));
    }, [condicao, legislaturaId]);

    const handleSelectUser = (u: UserResumo | null) => {
        setUser(u);
        if (u && !parliamentaryName) setParliamentaryName(u.nome);
    };

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
        !!user &&
        parliamentaryName.trim().length >= 3 &&
        !!legislaturaId &&
        !!condicao &&
        (condicao === 'TITULAR' || !!titularAfastadoId);

    async function handleSubmit() {
        if (!canSubmit || !user) return;
        setSaving(true);
        try {
            const dto: CreateParlamentarianUserDto = {
                userId: user.id,
                parliamentaryName: parliamentaryName.trim(),
                legislaturaId,
                condicao,
                ...(officeNumber.trim() ? { officeNumber: officeNumber.trim() } : {}),
                ...(politicalPartyId ? { politicalPartyId } : {}),
                ...(condicao === 'SUPLENTE' && titularAfastadoId ? { titularAfastadoId } : {}),
                ...(dataPosse ? { dataPosse: dataPosse.toISOString().slice(0, 10) } : {}),
            };
            await parlamentaresApi.createUser(parlamentarianId, dto);
            showSuccess('Vínculo adicionado com sucesso.');
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
                label="Adicionar vínculo"
                icon="pi pi-plus"
                loading={saving}
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={`Novo vínculo — ${activeUserName}`}
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(95vw, 660px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                {/* Vínculos existentes */}
                {existingUsers.length > 0 && (
                    <>
                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">Vínculos existentes</span>
                            <div className="flex flex-column gap-2">
                                {existingUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex align-items-center justify-content-between gap-2 p-2 border-round border-1 surface-border"
                                    >
                                        <div className="text-sm">
                                            <span className="font-medium">{u.legislatura.descricao}</span>
                                            <span className="text-color-secondary mx-2">·</span>
                                            <span className="text-color-secondary">{u.condicao}</span>
                                            <span className="text-color-secondary mx-2">·</span>
                                            <span className="text-color-secondary">{u.user.nome}</span>
                                        </div>
                                        <Tag
                                            value={STATUS_LABEL[u.status] ?? u.status}
                                            severity={STATUS_SEV[u.status] ?? 'secondary'}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider />
                    </>
                )}

                {/* Seção 1 — Usuário */}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Usuário</span>
                    <UserSearchField
                        value={user}
                        onChange={handleSelectUser}
                        hint="Busca entre os usuários já cadastrados no sistema."
                    />
                </div>

                {/* Seção 2 — Identificação parlamentar */}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação parlamentar</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="pv-nome">Nome Parlamentar *</label>
                        <InputText
                            id="pv-nome"
                            value={parliamentaryName}
                            onChange={(e) => setParliamentaryName(e.target.value)}
                            placeholder="Nome de urna"
                            className={`w-full${parliamentaryName && parliamentaryName.trim().length < 3 ? ' p-invalid' : ''}`}
                        />
                    </div>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2 mt-3">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pv-partido">Partido Político</label>
                            <PrDropdown
                                id="pv-partido"
                                value={politicalPartyId}
                                options={partidoOptions}
                                onChange={(e) => setPoliticalPartyId(String(e.value))}
                                placeholder="Selecione (opcional)"
                                className="w-full"
                                filter
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pv-gabinete">Nº do Gabinete</label>
                            <InputText
                                id="pv-gabinete"
                                value={officeNumber}
                                onChange={(e) => setOfficeNumber(e.target.value)}
                                placeholder="Ex.: 31, 31A, Térreo"
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Seção 3 — Mandato */}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Mandato</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="pv-legislatura">Legislatura *</label>
                            <PrDropdown
                                id="pv-legislatura"
                                value={legislaturaId}
                                options={legislaturaOptions}
                                onChange={(e) => setLegislaturaId(String(e.value))}
                                placeholder="Selecione a legislatura"
                                className="w-full"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label>Condição *</label>
                            <div className="flex gap-4 align-items-center mt-2">
                                <div className="flex align-items-center gap-2">
                                    <RadioButton
                                        inputId="pv-titular"
                                        name="pv-condicao"
                                        value="TITULAR"
                                        checked={condicao === 'TITULAR'}
                                        onChange={(e) => {
                                            setCondicao(e.value as CondicaoMandato);
                                            setTitularAfastadoId('');
                                        }}
                                    />
                                    <label htmlFor="pv-titular" className="cursor-pointer">Titular</label>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <RadioButton
                                        inputId="pv-suplente"
                                        name="pv-condicao"
                                        value="SUPLENTE"
                                        checked={condicao === 'SUPLENTE'}
                                        onChange={(e) => setCondicao(e.value as CondicaoMandato)}
                                    />
                                    <label htmlFor="pv-suplente" className="cursor-pointer">Suplente</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {condicao === 'SUPLENTE' && (
                        <div className="sigl-filtro-campo mt-3">
                            <label htmlFor="pv-titular-afastado">Titular afastado *</label>
                            <PrDropdown
                                id="pv-titular-afastado"
                                value={titularAfastadoId}
                                options={titularesOptions}
                                onChange={(e) => setTitularAfastadoId(String(e.value))}
                                placeholder={!legislaturaId ? 'Selecione a legislatura primeiro' : 'Selecione o titular'}
                                className="w-full"
                                disabled={!legislaturaId}
                                filter
                            />
                        </div>
                    )}

                    <div className="sigl-filtro-campo mt-3">
                        <label htmlFor="pv-data-posse">Data da Posse</label>
                        <Calendar
                            id="pv-data-posse"
                            value={dataPosse}
                            onChange={(e) => setDataPosse(e.value ?? null)}
                            dateFormat="dd/mm/yy"
                            locale="pt"
                            showIcon
                            placeholder="dd/mm/aaaa"
                            className="w-full"
                        />
                        <small className="text-color-secondary">Opcional — para relatórios oficiais.</small>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
