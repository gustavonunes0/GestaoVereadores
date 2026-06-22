import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { AutoComplete } from 'primereact/autocomplete';
import { Dropdown as PrDropdown } from 'primereact/dropdown';
import { materiasApi } from '../../api/legislative/materias.api';
import { parlamentaresApi, type Parliamentarian } from '../../api/legislative/parlamentares.api';
import { tenantPartnersApi, type TenantPartner } from '../../api/tenant-partners.api';
import { useAppToast } from '../../hooks/useAppToast';
import type { CoautorMateria, TipoAutorMateria } from '../../types/materias';

const TIPOS_COAUTOR: Array<{ value: TipoAutorMateria; label: string }> = [
    { value: 'PARLAMENTAR',    label: 'Parlamentar' },
    { value: 'TENANT_PARTNER', label: 'Instituição parceira' },
];

const FILTRO_OPTIONS = [
    { value: '',               label: 'Todos' },
    { value: 'PARLAMENTAR',    label: 'Parlamentar' },
    { value: 'TENANT_PARTNER', label: 'Inst. Parceira' },
];

interface AddCoautorDialogProps {
    materiaId: string;
    onClose: () => void;
    onSaved: () => void;
}

function AddCoautorDialog({ materiaId, onClose, onSaved }: AddCoautorDialogProps) {
    const { showSuccess, showApiError, showToast } = useAppToast();
    const showWarning = (msg: string) => showToast('warn', 'Aviso', msg);
    const [saving, setSaving] = useState(false);
    const [tipoCoautor, setTipoCoautor] = useState<TipoAutorMateria | ''>('');

    // PARLAMENTAR
    const [parlSugestoes, setParlSugestoes] = useState<Parliamentarian[]>([]);
    const [parlSelecionado, setParlSelecionado] = useState<Parliamentarian | null>(null);

    // TENANT_PARTNER
    const [partners, setPartners] = useState<TenantPartner[]>([]);
    const [partnerSelecionado, setPartnerSelecionado] = useState<TenantPartner | null>(null);
    const [loadingPartners, setLoadingPartners] = useState(false);

    const buscarParlamentar = async (query: string) => {
        if (query.length < 2) { setParlSugestoes([]); return; }
        try {
            const res = await parlamentaresApi.list({ busca: query, limit: 20 });
            setParlSugestoes(res.data);
        } catch {
            setParlSugestoes([]);
        }
    };

    useEffect(() => {
        if (tipoCoautor !== 'TENANT_PARTNER') return;
        setLoadingPartners(true);
        tenantPartnersApi.list({ limit: 100 })
            .then((r) => setPartners(r.data))
            .catch(() => setPartners([]))
            .finally(() => setLoadingPartners(false));
    }, [tipoCoautor]);

    useEffect(() => {
        setParlSelecionado(null);
        setPartnerSelecionado(null);
    }, [tipoCoautor]);

    const handleSelectPartner = (partner: TenantPartner | null) => {
        setPartnerSelecionado(partner);
        if (partner && !partner.usuario && !partner.usuarioVinculado) {
            showWarning('Esta instituição não possui usuário vinculado. Vincule em Câmara > Autores.');
        }
    };

    async function handleSubmit() {
        if (!tipoCoautor) return;

        if (tipoCoautor === 'PARLAMENTAR') {
            if (!parlSelecionado) {
                showApiError(new Error('Selecione o parlamentar coautor.'));
                return;
            }
            setSaving(true);
            try {
                await materiasApi.addCoautor(materiaId, {
                    parliamentarianId: parlSelecionado.id,
                });
                showSuccess('Coautor adicionado.');
                onSaved();
                onClose();
            } catch (err) {
                showApiError(err);
            } finally {
                setSaving(false);
            }
            return;
        }

        if (tipoCoautor === 'TENANT_PARTNER') {
            showApiError(new Error('Coautores de instituição parceira ainda não são suportados.'));
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button label="Adicionar" icon="pi pi-plus" loading={saving} onClick={() => void handleSubmit()} />
        </div>
    );

    return (
        <Dialog
            header="Adicionar Coautor"
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(95vw, 480px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-filtro-campo">
                    <label htmlFor="ca-tipo">Tipo de Coautor *</label>
                    <PrDropdown
                        id="ca-tipo"
                        value={tipoCoautor}
                        options={TIPOS_COAUTOR}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o tipo"
                        onChange={(e) => setTipoCoautor(e.value as TipoAutorMateria)}
                        className="w-full"
                    />
                </div>

                {tipoCoautor === 'PARLAMENTAR' && (
                    <div className="sigl-filtro-campo mt-3">
                        <label>Parlamentar *</label>
                        <AutoComplete
                            value={parlSelecionado ?? undefined}
                            suggestions={parlSugestoes}
                            completeMethod={(e) => void buscarParlamentar(e.query)}
                            field="parliamentaryName"
                            itemTemplate={(p: Parliamentarian) => (
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.parliamentaryName}</span>
                                </div>
                            )}
                            onChange={(e) => setParlSelecionado((e.value as Parliamentarian | undefined) ?? null)}
                            onSelect={(e) => setParlSelecionado(e.value as Parliamentarian)}
                            placeholder="Digite o nome para buscar…"
                            minLength={2}
                            forceSelection
                            emptyMessage="Nenhum parlamentar encontrado"
                            className="w-full"
                            style={{ width: '100%' }}
                        />
                    </div>
                )}

                {tipoCoautor === 'TENANT_PARTNER' && (
                    <div className="sigl-filtro-campo mt-3">
                        <label>Instituição parceira *</label>
                        <PrDropdown
                            value={partnerSelecionado}
                            options={partners}
                            optionLabel="nome"
                            placeholder={loadingPartners ? 'Carregando...' : 'Selecione a instituição'}
                            onChange={(e) => handleSelectPartner(e.value as TenantPartner)}
                            className="w-full"
                            disabled={loadingPartners}
                            filter
                        />
                    </div>
                )}
            </div>
        </Dialog>
    );
}

interface CoautorSectionProps {
    materiaId: string;
    readOnly?: boolean;
}

export function CoautorSection({ materiaId, readOnly = false }: CoautorSectionProps) {
    const { showSuccess, showApiError } = useAppToast();
    const [coautores, setCoautores] = useState<CoautorMateria[]>([]);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);

    const carregar = useCallback(() => {
        setLoading(true);
        materiasApi.listCoautores(materiaId)
            .then(setCoautores)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [materiaId, showApiError]);

    useEffect(() => { carregar(); }, [carregar]);

    async function handleRemover(coautorId: string) {
        try {
            await materiasApi.removeCoautor(materiaId, coautorId);
            showSuccess('Coautor removido.');
            carregar();
        } catch (err) {
            showApiError(err);
        }
    }

    function getNomeCoautor(c: CoautorMateria): string {
        if (c.parlamentar?.nomeParlamentar) return c.parlamentar.nomeParlamentar;
        if (c.tenantPartnerUser?.nome) {
            const parceiro = c.tenantPartnerUser.tenantPartner?.nome;
            return parceiro ? `${c.tenantPartnerUser.nome} (${parceiro})` : c.tenantPartnerUser.nome;
        }
        return '—';
    }

    const coautoresFiltrados = filtroTipo
        ? coautores.filter((c) => c.tipoCoautor === filtroTipo)
        : coautores;

    return (
        <div className="sigl-dialog-secao">
            <div className="flex align-items-center justify-content-between gap-2 mb-2">
                <span className="sigl-dialog-secao-titulo">Coautores</span>
                <div className="flex align-items-center gap-2">
                    <PrDropdown
                        value={filtroTipo}
                        options={FILTRO_OPTIONS}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => setFiltroTipo(String(e.value))}
                        style={{ height: '2rem', fontSize: '0.8rem' }}
                    />
                    {!readOnly && (
                        <Button
                            label="+ Adicionar coautor"
                            size="small"
                            severity="secondary"
                            onClick={() => setShowAddDialog(true)}
                        />
                    )}
                </div>
            </div>

            {loading ? (
                <p className="text-color-secondary text-sm m-0">Carregando…</p>
            ) : coautoresFiltrados.length === 0 ? (
                <p className="text-color-secondary text-sm m-0">Nenhum coautor adicionado.</p>
            ) : (
                <ul className="list-none p-0 m-0 flex flex-column gap-2">
                    {coautoresFiltrados.map((c) => (
                        <li
                            key={c.id}
                            className="flex align-items-center justify-content-between gap-2 p-2 border-round border-1 surface-border"
                        >
                            <div className="flex align-items-center gap-2">
                                <span className="text-sm font-medium">{getNomeCoautor(c)}</span>
                                <Tag
                                    value={c.tipoCoautor === 'PARLAMENTAR' ? 'Parlamentar' : 'Inst. Parceira'}
                                    severity={c.tipoCoautor === 'PARLAMENTAR' ? 'info' : 'secondary'}
                                />
                            </div>
                            {!readOnly && (
                                <Button
                                    icon="pi pi-times"
                                    rounded
                                    text
                                    size="small"
                                    severity="danger"
                                    aria-label="Remover coautor"
                                    onClick={() => void handleRemover(c.id)}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showAddDialog && (
                <AddCoautorDialog
                    materiaId={materiaId}
                    onClose={() => setShowAddDialog(false)}
                    onSaved={() => { setShowAddDialog(false); carregar(); }}
                />
            )}
        </div>
    );
}
