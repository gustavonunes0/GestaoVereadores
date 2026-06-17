import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { MODULE_ICONS } from '../app/navigation';
import { agendaApi } from '../api/legislative/agenda.api';
import { sessoesApi } from '../api/legislative/sessoes.api';
import { PageHeader } from '../components/PageHeader';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { DatePicker, DateRangePicker, Dropdown, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';

type TipoEvento = 'SESSAO' | 'REUNIAO' | 'AUDIENCIA' | 'EVENTO' | 'COMPROMISSO';

const TIPO_OPTIONS: { label: string; value: TipoEvento }[] = [
    { label: 'Sessão plenária', value: 'SESSAO' },
    { label: 'Reunião de comissão', value: 'REUNIAO' },
    { label: 'Audiência pública', value: 'AUDIENCIA' },
    { label: 'Evento', value: 'EVENTO' },
    { label: 'Compromisso', value: 'COMPROMISSO' },
];

type Severity = 'info' | 'success' | 'warning' | 'secondary' | 'danger';

const TIPO_SEVERITY: Record<TipoEvento, Severity> = {
    SESSAO: 'success',
    REUNIAO: 'info',
    AUDIENCIA: 'warning',
    EVENTO: 'secondary',
    COMPROMISSO: 'secondary',
};

type AgendaItem = {
    id: string;
    titulo?: string;
    tipo?: TipoEvento;
    dataInicio?: string;
    dataFim?: string;
    local?: string;
    sessaoPlenariaId?: string;
    linkTransmissao?: string;
    publicoExterno?: boolean;
};

interface AgendaFormState {
    titulo: string;
    tipo: TipoEvento;
    dataInicio: Date | null;
    dataFim: Date | null;
    local: string;
    sessaoPlenariaId: string;
    linkTransmissao: string;
    publicoExterno: boolean;
}

function emptyForm(): AgendaFormState {
    return {
        titulo: '',
        tipo: 'EVENTO',
        dataInicio: null,
        dataFim: null,
        local: '',
        sessaoPlenariaId: '',
        linkTransmissao: '',
        publicoExterno: false,
    };
}

export function AgendaPage() {
    const { canDelete } = usePermissions();
    const { showSuccess, showApiError } = useAppToast();

    const [items, setItems] = useState<AgendaItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [saving, setSaving] = useState(false);

    const [filtroTipo, setFiltroTipo] = useState<TipoEvento | ''>('');
    const [filtroDataRange, setFiltroDataRange] = useState<[Date | null, Date | null]>([null, null]);
    const [filtroPublico, setFiltroPublico] = useState(false);
    const [filtrosApplied, setFiltrosApplied] = useState<Record<string, unknown>>({});

    const [sessoes, setSessoes] = useState<{ id: string; label: string }[]>([]);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogDeletar, setDialogDeletar] = useState<AgendaItem | null>(null);

    const [form, setForm] = useState<AgendaFormState>(emptyForm());
    const patch = (v: Partial<AgendaFormState>) => setForm((f) => ({ ...f, ...v }));

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await agendaApi.list({ ...filtrosApplied, page, limit: 20 } as Record<string, string | number | boolean | undefined>);
            const data = res.data as AgendaItem[];
            setItems(data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    useEffect(() => {
        sessoesApi.list({ limit: 100 })
            .then((r) => {
                const opts = r.data
                    .filter((s) => s.statusSessao === 'AGENDADA')
                    .map((s) => ({
                        id: s.id,
                        label: `${s.tipo?.nome ?? 'Sessão'} — ${s.dataAbertura ? new Date(s.dataAbertura).toLocaleDateString('pt-BR') : s.id}`,
                    }));
                setSessoes(opts);
            })
            .catch(() => setSessoes([]));
    }, []);

    function aplicarFiltros() {
        const params: Record<string, unknown> = {};
        if (filtroTipo) params.tipo = filtroTipo;
        if (filtroDataRange[0]) params.dataInicio = (filtroDataRange[0] as Date).toISOString();
        if (filtroDataRange[1]) params.dataFim = (filtroDataRange[1] as Date).toISOString();
        if (filtroPublico) params.publicoExterno = true;
        setPage(1);
        setFiltrosApplied(params);
    }

    function limparFiltros() {
        setFiltroTipo('');
        setFiltroDataRange([null, null]);
        setFiltroPublico(false);
        setFiltrosApplied({});
        setPage(1);
    }

    function openCriar() {
        setForm(emptyForm());
        setDialogCriar(true);
    }

    async function handleCreate() {
        if (!form.titulo.trim()) return;
        setSaving(true);
        try {
            await agendaApi.create({
                titulo: form.titulo.trim(),
                tipo: form.tipo,
                dataInicio: form.dataInicio?.toISOString(),
                dataFim: form.dataFim?.toISOString(),
                local: form.local.trim() || undefined,
                sessaoPlenariaId: form.sessaoPlenariaId || undefined,
                linkTransmissao: form.linkTransmissao.trim() || undefined,
                publicoExterno: form.publicoExterno,
            });
            showSuccess('Evento adicionado à agenda.');
            setDialogCriar(false);
            void buscar();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const tipoLabel = (tipo?: TipoEvento) =>
        TIPO_OPTIONS.find((t) => t.value === tipo)?.label ?? tipo ?? '—';

    const columns = (
        <>
            <Column
                header="Tipo"
                body={(row: AgendaItem) =>
                    row.tipo ? (
                        <Tag
                            value={tipoLabel(row.tipo)}
                            severity={TIPO_SEVERITY[row.tipo]}
                        />
                    ) : '—'
                }
                style={{ width: '10rem' }}
            />
            <Column
                header="Título"
                body={(row: AgendaItem) => <span className="font-medium">{row.titulo ?? '—'}</span>}
            />
            <Column
                header="Data início"
                body={(row: AgendaItem) => formatDatePt(row.dataInicio)}
                style={{ width: '8rem' }}
            />
            <Column
                header="Local"
                body={(row: AgendaItem) => row.local ?? '—'}
                style={{ width: '10rem' }}
            />
            <Column
                header="Sessão"
                body={(row: AgendaItem) =>
                    row.sessaoPlenariaId ? (
                        <a
                            href={`/sessoes?id=${row.sessaoPlenariaId}`}
                            aria-label="Ver sessão vinculada"
                            className="text-primary"
                        >
                            Ver sessão
                        </a>
                    ) : '—'
                }
                style={{ width: '8rem' }}
            />
            <Column
                header="Público"
                body={(row: AgendaItem) =>
                    row.publicoExterno ? (
                        <Tag value="Público" severity="info" />
                    ) : null
                }
                style={{ width: '6rem' }}
            />
        </>
    );

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={() => setDialogCriar(false)} disabled={saving} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={saving}
                onClick={() => void handleCreate()}
                disabled={!form.titulo.trim()}
            />
        </div>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.agenda}
                title="Agenda legislativa"
                subtitle="Compromissos e eventos da câmara municipal."
                actions={
                    <Button label="Adicionar evento" icon="pi pi-plus" onClick={openCriar} />
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                <div className="sigl-filtro-campo">
                    <label htmlFor="ag-tipo">Tipo de evento</label>
                    <Dropdown
                        id="ag-tipo"
                        value={filtroTipo}
                        options={withEmptyOption(TIPO_OPTIONS)}
                        onChange={(v) => setFiltroTipo(v as TipoEvento | '')}
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <DateRangePicker
                        id="ag-data"
                        label="Período"
                        value={filtroDataRange}
                        onChange={setFiltroDataRange}
                    />
                </div>
                <div className="sigl-filtro-campo flex items-end">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            inputId="ag-pub"
                            checked={filtroPublico}
                            onChange={(e) => setFiltroPublico(e.checked ?? false)}
                        />
                        <label htmlFor="ag-pub">Apenas eventos públicos</label>
                    </div>
                </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de eventos da agenda">
                <DataTableLayout<AgendaItem>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                canWrite={canDelete}
                onDeletar={canDelete ? (item) => setDialogDeletar(item) : undefined}
                />
            </section>

            <Dialog
                header="Adicionar evento à agenda"
                visible={dialogCriar}
                onHide={() => setDialogCriar(false)}
                style={{ width: 'min(90vw, 660px)' }}
                footer={dialogFooter}
                modal
            >
                <div className="sigl-dialog-body">
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Evento</span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <label htmlFor="ag-titulo">Título / assunto *</label>
                                <InputText
                                    id="ag-titulo"
                                    value={form.titulo}
                                    onChange={(e) => patch({ titulo: e.target.value })}
                                    placeholder="Ex.: Sessão ordinária de junho"
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <label htmlFor="ag-tipo-form">Tipo *</label>
                                <Dropdown
                                    id="ag-tipo-form"
                                    value={form.tipo}
                                    options={TIPO_OPTIONS}
                                    onChange={(v) => patch({ tipo: v as TipoEvento, sessaoPlenariaId: '' })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Período</span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            <div className="sigl-filtro-campo">
                                <DatePicker
                                    id="ag-inicio-form"
                                    label="Data início"
                                    value={form.dataInicio}
                                    onChange={(d) => patch({ dataInicio: d })}
                                    withTime
                                />
                            </div>
                            <div className="sigl-filtro-campo">
                                <DatePicker
                                    id="ag-fim-form"
                                    label="Data fim"
                                    value={form.dataFim}
                                    onChange={(d) => patch({ dataFim: d })}
                                    withTime
                                />
                            </div>
                        </div>
                    </div>
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Localização e vínculos</span>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ag-local">Local</label>
                            <InputText
                                id="ag-local"
                                value={form.local}
                                onChange={(e) => patch({ local: e.target.value })}
                                placeholder="Ex.: Plenário da Câmara Municipal"
                            />
                        </div>
                        {form.tipo === 'SESSAO' && sessoes.length > 0 && (
                            <div className="sigl-filtro-campo">
                                <label htmlFor="ag-sessao">Sessão vinculada</label>
                                <Dropdown
                                    id="ag-sessao"
                                    value={form.sessaoPlenariaId}
                                    options={withEmptyOption(
                                        sessoes.map((s) => ({ label: s.label, value: s.id })),
                                        'Nenhuma',
                                    )}
                                    onChange={(v) => patch({ sessaoPlenariaId: String(v) })}
                                    placeholder="Selecione a sessão agendada"
                                />
                            </div>
                        )}
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ag-link">Link de transmissão</label>
                            <InputText
                                id="ag-link"
                                value={form.linkTransmissao}
                                onChange={(e) => patch({ linkTransmissao: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Visibilidade</span>
                        <div className="sigl-filtro-campo flex align-items-center gap-2">
                            <Checkbox
                                inputId="ag-pub-form"
                                checked={form.publicoExterno}
                                onChange={(e) => patch({ publicoExterno: e.checked ?? false })}
                            />
                            <label htmlFor="ag-pub-form" className="cursor-pointer">
                                Evento público externo
                            </label>
                            <Tooltip target="#ag-pub-form" content="Eventos públicos aparecem no portal da câmara sem login" position="right" />
                        </div>
                    </div>
                </div>
            </Dialog>

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir evento"
                    message={`Deseja excluir "${dialogDeletar.titulo ?? 'este evento'}" da agenda? Esta ação não pode ser desfeita.`}
                    onConfirm={() => agendaApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}
        </main>
    );
}
