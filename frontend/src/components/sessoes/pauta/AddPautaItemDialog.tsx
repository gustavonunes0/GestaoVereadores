import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { api } from '../../../api/client';
import { API_PATHS } from '../../../api/paths';
import { atosApi } from '../../../api/atos.api';
import { normasApi } from '../../../api/normas.api';
import { comissoesApi } from '../../../api/legislative/comissoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import { inferirFase, inferirTipo } from '../../../utils/pautaInferencia';
import { Dropdown, type DropdownOption } from '../../ui';
import type {
    AddPautaItemDto,
    FasePauta,
    PautaItemCategoria,
    TipoPautaItem,
} from '../../../types/sessoes';
import { PAUTA_CATEGORIA_LABELS } from '../../../types/sessoes';

interface Option {
    id: string;
    label: string;
    sigla?: string;
}

interface MateriaApi {
    id: string;
    tipoMateria?: { sigla?: string; nome?: string };
    tipo?: { sigla?: string; nome?: string };
    numero?: string | null;
    numeroProtocolo?: number | string | null;
    ano?: number | null;
    ementa?: string;
    identificacao?: string | null;
    sigla?: string | null;
}

interface Props {
    sessaoId: string;
    onClose: () => void;
    onSaved: () => void;
}

const CATEGORIAS: DropdownOption[] = [
    { label: PAUTA_CATEGORIA_LABELS.MATERIA, value: 'MATERIA' },
    { label: PAUTA_CATEGORIA_LABELS.COMISSAO, value: 'COMISSAO' },
    { label: PAUTA_CATEGORIA_LABELS.ATO, value: 'ATO' },
    { label: PAUTA_CATEGORIA_LABELS.NORMA, value: 'NORMA' },
    { label: PAUTA_CATEGORIA_LABELS.AVISO, value: 'AVISO' },
];

const FASES: DropdownOption[] = [
    { label: 'Pequeno Expediente', value: 'PEQUENO_EXPEDIENTE' },
    { label: 'Grande Expediente', value: 'GRANDE_EXPEDIENTE' },
    { label: 'Ordem do Dia', value: 'ORDEM_DO_DIA' },
    { label: 'Explicações Pessoais', value: 'EXPLICACOES_PESSOAIS' },
];

const TIPOS: DropdownOption[] = [
    { label: 'Leitura', value: 'LEITURA' },
    { label: 'Deliberação', value: 'DELIBERACAO' },
    { label: 'Comunicação', value: 'COMUNICACAO' },
];

function materiaOptionLabel(m: MateriaApi): string {
    const sigla = m.tipoMateria?.sigla ?? m.tipo?.sigla ?? m.sigla ?? 'Matéria';
    const identificacao =
        m.identificacao?.trim() ||
        (m.numero
            ? `${sigla} nº ${m.numero}/${m.ano ?? '?'}`
            : m.numeroProtocolo != null
              ? `${sigla} Prot. nº ${m.numeroProtocolo}${m.ano ? `/${m.ano}` : ''}`
              : sigla);
    const ementa = (m.ementa ?? '').slice(0, 80);
    return ementa ? `${identificacao} — ${ementa}` : identificacao;
}

function toDropdownOptions(items: Option[]): DropdownOption[] {
    return items.map((item) => ({ label: item.label, value: item.id }));
}

export function AddPautaItemDialog({ sessaoId, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [categoria, setCategoria] = useState<PautaItemCategoria>('MATERIA');
    const [materias, setMaterias] = useState<Option[]>([]);
    const [atos, setAtos] = useState<Option[]>([]);
    const [normas, setNormas] = useState<Option[]>([]);
    const [comissoes, setComissoes] = useState<Option[]>([]);

    const [materiaId, setMateriaId] = useState('');
    const [atoId, setAtoId] = useState('');
    const [normaId, setNormaId] = useState('');
    const [comissaoId, setComissaoId] = useState('');
    const [avisoTitulo, setAvisoTitulo] = useState('');
    const [avisoTexto, setAvisoTexto] = useState('');

    const [fase, setFase] = useState<FasePauta>('ORDEM_DO_DIA');
    const [tipo, setTipo] = useState<TipoPautaItem>('DELIBERACAO');
    const [inferido, setInferido] = useState(false);

    const carregarOpcoes = useCallback(async () => {
        setLoading(true);
        try {
            const [matRes, atoRes, normaRes, comRes] = await Promise.all([
                api<{ data: MateriaApi[] }>(`${API_PATHS.materias}?limit=100`),
                atosApi.list({ limit: 100 }),
                normasApi.list({ limit: 100 }),
                comissoesApi.list({ limit: 100 }),
            ]);

            setMaterias(
                matRes.data.map((m) => ({
                    id: m.id,
                    sigla: m.tipoMateria?.sigla ?? m.tipo?.sigla ?? m.sigla ?? '',
                    label: materiaOptionLabel(m),
                })),
            );
            setAtos(
                atoRes.data.map((a) => ({
                    id: a.id,
                    label: `${a.tipo?.nome ?? 'Ato'} nº ${a.numero}${a.ementa ? ` — ${a.ementa.slice(0, 60)}` : ''}`,
                })),
            );
            setNormas(
                normaRes.data.map((n) => ({
                    id: n.id,
                    label: `${n.tipo?.nome ?? 'Norma'} nº ${n.numero}${n.ementa ? ` — ${n.ementa.slice(0, 60)}` : ''}`,
                })),
            );
            setComissoes(
                comRes.data.map((c) => ({
                    id: c.id,
                    label: c.acronym ? `${c.acronym} — ${c.name}` : c.name,
                    sigla: c.acronym ?? undefined,
                })),
            );
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [showApiError]);

    useEffect(() => {
        void carregarOpcoes();
    }, [carregarOpcoes]);

    function handleCategoriaChange(cat: PautaItemCategoria) {
        setCategoria(cat);
        setInferido(false);
        if (cat === 'AVISO') {
            setFase('PEQUENO_EXPEDIENTE');
            setTipo('COMUNICACAO');
        } else if (cat === 'ATO' || cat === 'NORMA') {
            setFase('PEQUENO_EXPEDIENTE');
            setTipo('LEITURA');
        } else if (cat === 'COMISSAO') {
            setFase('ORDEM_DO_DIA');
            setTipo('DELIBERACAO');
        }
    }

    function handleSelecionarMateria(id: string) {
        setMateriaId(id);
        if (categoria !== 'MATERIA') return;
        const mat = materias.find((m) => m.id === id);
        if (mat?.sigla) {
            setFase(inferirFase(mat.sigla));
            setTipo(inferirTipo(inferirFase(mat.sigla)));
            setInferido(true);
        }
    }

    const podeSalvar =
        categoria === 'MATERIA'
            ? !!materiaId
            : categoria === 'COMISSAO'
              ? !!materiaId && !!comissaoId
              : categoria === 'ATO'
                ? !!atoId
                : categoria === 'NORMA'
                  ? !!normaId
                  : !!avisoTitulo.trim();

    async function submit() {
        if (!podeSalvar) return;
        setSaving(true);
        try {
            const body: AddPautaItemDto = { categoria, fase, tipoPautaItem: tipo };
            if (categoria === 'MATERIA' || categoria === 'COMISSAO') body.materiaId = materiaId;
            if (categoria === 'COMISSAO') body.comissaoId = comissaoId;
            if (categoria === 'ATO') body.atoId = atoId;
            if (categoria === 'NORMA') body.normaId = normaId;
            if (categoria === 'AVISO') {
                body.avisoTitulo = avisoTitulo.trim();
                body.avisoTexto = avisoTexto.trim() || undefined;
            }

            await sessoesApi.addPautaItemDetalhe(sessaoId, body as Record<string, unknown>);
            showSuccess('Item adicionado à pauta.');
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
                label="Adicionar"
                icon="pi pi-plus"
                loading={saving}
                disabled={!podeSalvar}
                onClick={() => void submit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Adicionar item à pauta"
            visible
            onHide={onClose}
            style={{ width: 'min(92vw, 720px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-grid-12">
                    <div className="sigl-col-6 sigl-filtro-campo">
                        <label htmlFor="add-pauta-categoria">Tipo de item *</label>
                        <Dropdown
                            id="add-pauta-categoria"
                            value={categoria}
                            options={CATEGORIAS}
                            onChange={(v) => handleCategoriaChange(v as PautaItemCategoria)}
                        />
                    </div>

                    {(categoria === 'MATERIA' || categoria === 'COMISSAO') && (
                        <div className="sigl-col-6 sigl-filtro-campo">
                            <label htmlFor="add-pauta-materia">
                                {categoria === 'COMISSAO'
                                    ? 'Matéria objeto do parecer *'
                                    : 'Matéria *'}
                            </label>
                            <Dropdown
                                id="add-pauta-materia"
                                value={materiaId || null}
                                options={toDropdownOptions(materias)}
                                filter
                                loading={loading}
                                placeholder="Selecione a matéria"
                                onChange={(v) => handleSelecionarMateria(String(v))}
                            />
                        </div>
                    )}

                    {categoria === 'COMISSAO' && (
                        <div className="sigl-col-6 sigl-filtro-campo">
                            <label htmlFor="add-pauta-comissao">Comissão *</label>
                            <Dropdown
                                id="add-pauta-comissao"
                                value={comissaoId || null}
                                options={toDropdownOptions(comissoes)}
                                filter
                                loading={loading}
                                placeholder="Selecione a comissão"
                                onChange={(v) => setComissaoId(String(v))}
                            />
                        </div>
                    )}

                    {categoria === 'ATO' && (
                        <div className="sigl-col-6 sigl-filtro-campo">
                            <label htmlFor="add-pauta-ato">Ato administrativo *</label>
                            <Dropdown
                                id="add-pauta-ato"
                                value={atoId || null}
                                options={toDropdownOptions(atos)}
                                filter
                                loading={loading}
                                placeholder="Selecione o ato"
                                onChange={(v) => setAtoId(String(v))}
                            />
                        </div>
                    )}

                    {categoria === 'NORMA' && (
                        <div className="sigl-col-6 sigl-filtro-campo">
                            <label htmlFor="add-pauta-norma">Norma jurídica *</label>
                            <Dropdown
                                id="add-pauta-norma"
                                value={normaId || null}
                                options={toDropdownOptions(normas)}
                                filter
                                loading={loading}
                                placeholder="Selecione a norma"
                                onChange={(v) => setNormaId(String(v))}
                            />
                        </div>
                    )}

                    {categoria === 'AVISO' && (
                        <div className="sigl-col-6 sigl-filtro-campo">
                            <label htmlFor="add-pauta-aviso-titulo">Título do aviso *</label>
                            <InputText
                                id="add-pauta-aviso-titulo"
                                value={avisoTitulo}
                                onChange={(e) => setAvisoTitulo(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    )}

                    {categoria !== 'AVISO' && (
                        <>
                            <div className="sigl-col-6 sigl-filtro-campo">
                                <label htmlFor="add-pauta-fase">Fase</label>
                                <Dropdown
                                    id="add-pauta-fase"
                                    value={fase}
                                    options={FASES}
                                    onChange={(v) => setFase(v as FasePauta)}
                                />
                            </div>
                            <div className="sigl-col-6 sigl-filtro-campo">
                                <label htmlFor="add-pauta-tipo">Tipo</label>
                                <Dropdown
                                    id="add-pauta-tipo"
                                    value={tipo}
                                    options={TIPOS}
                                    onChange={(v) => setTipo(v as TipoPautaItem)}
                                />
                            </div>
                        </>
                    )}

                    {categoria === 'AVISO' && (
                        <div className="sigl-col-12 sigl-filtro-campo">
                            <label htmlFor="add-pauta-aviso-texto">Texto do aviso</label>
                            <InputTextarea
                                id="add-pauta-aviso-texto"
                                value={avisoTexto}
                                onChange={(e) => setAvisoTexto(e.target.value)}
                                rows={4}
                                className="w-full"
                            />
                        </div>
                    )}

                    {inferido && categoria === 'MATERIA' && (
                        <div className="sigl-col-12">
                            <Message
                                severity="info"
                                text="Fase e tipo inferidos automaticamente pela sigla da matéria. Você pode alterar abaixo."
                            />
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
