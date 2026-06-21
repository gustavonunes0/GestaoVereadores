import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { api } from '../../../api/client';
import { API_PATHS } from '../../../api/paths';
import { useAppToast } from '../../../hooks/useAppToast';
import { inferirFase, inferirTipo } from '../../../utils/pautaInferencia';
import type { FasePauta, TipoPautaItem } from '../../../types/sessoes';

interface MateriaOption {
    id: string;
    label: string;
    sigla: string;
    ementa: string;
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

const FASES: { label: string; value: FasePauta }[] = [
    { label: 'Pequeno Expediente', value: 'PEQUENO_EXPEDIENTE' },
    { label: 'Grande Expediente',  value: 'GRANDE_EXPEDIENTE' },
    { label: 'Ordem do Dia',       value: 'ORDEM_DO_DIA' },
    { label: 'Explicações Pessoais', value: 'EXPLICACOES_PESSOAIS' },
];

const TIPOS: { label: string; value: TipoPautaItem }[] = [
    { label: 'Leitura',     value: 'LEITURA' },
    { label: 'Deliberação', value: 'DELIBERACAO' },
    { label: 'Comunicação', value: 'COMUNICACAO' },
];

function materiaOptionLabel(m: MateriaApi): string {
    const sigla = m.tipoMateria?.sigla ?? m.tipo?.sigla ?? m.sigla ?? 'Matéria';
    const identificacao = m.identificacao?.trim()
        || (m.numero
            ? `${sigla} nº ${m.numero}/${m.ano ?? '?'}`
            : m.numeroProtocolo != null
                ? `${sigla} Prot. nº ${m.numeroProtocolo}${m.ano ? `/${m.ano}` : ''}`
                : sigla);
    const ementa = (m.ementa ?? '').slice(0, 80);
    return ementa ? `${identificacao} — ${ementa}` : identificacao;
}

export function AddPautaItemDialog({ sessaoId, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [materias, setMaterias] = useState<MateriaOption[]>([]);
    const [loadingMaterias, setLoadingMaterias] = useState(true);
    const [saving, setSaving] = useState(false);

    const [materiaId, setMateriaId] = useState('');
    const [fase, setFase] = useState<FasePauta>('ORDEM_DO_DIA');
    const [tipo, setTipo] = useState<TipoPautaItem>('DELIBERACAO');
    const [inferido, setInferido] = useState(false);

    const carregarMaterias = useCallback(async () => {
        setLoadingMaterias(true);
        try {
            const res = await api<{ data: MateriaApi[] }>(
                `${API_PATHS.materias}?limit=100`,
            );
            setMaterias(
                res.data.map((m) => {
                    const sigla = m.tipoMateria?.sigla ?? m.tipo?.sigla ?? m.sigla ?? '';
                    return {
                        id: m.id,
                        sigla,
                        label: materiaOptionLabel(m),
                        ementa: m.ementa ?? '',
                    };
                }),
            );
        } catch (err) {
            showApiError(err);
        } finally {
            setLoadingMaterias(false);
        }
    }, [showApiError]);

    useEffect(() => { void carregarMaterias(); }, [carregarMaterias]);

    function handleSelecionarMateria(id: string) {
        setMateriaId(id);
        const mat = materias.find((m) => m.id === id);
        if (mat?.sigla) {
            const faseDerived = inferirFase(mat.sigla);
            const tipoDerived = inferirTipo(faseDerived);
            setFase(faseDerived);
            setTipo(tipoDerived);
            setInferido(true);
        }
    }

    async function submit() {
        if (!materiaId) return;
        setSaving(true);
        try {
            await sessoesApi.addPautaItemDetalhe(sessaoId, { materiaId, fase, tipoPautaItem: tipo });
            showSuccess('Matéria adicionada à pauta.');
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
            <Button label="Adicionar" icon="pi pi-plus" loading={saving} disabled={!materiaId} onClick={() => void submit()} />
        </div>
    );

    return (
        <Dialog
            header="Adicionar matéria à pauta"
            visible
            onHide={onClose}
            style={{ width: 'min(92vw, 560px)' }}
            footer={footer}
            modal
        >
            <div className="flex flex-column gap-3">
                <div className="sigl-filtro-campo">
                    <label htmlFor="add-pauta-materia">Matéria *</label>
                    <Dropdown
                        id="add-pauta-materia"
                        value={materiaId}
                        options={materias}
                        optionValue="id"
                        optionLabel="label"
                        filter
                        loading={loadingMaterias}
                        placeholder="Selecione a matéria"
                        onChange={(e) => handleSelecionarMateria(String(e.value))}
                        style={{ width: '100%' }}
                    />
                </div>

                {inferido && (
                    <Message
                        severity="info"
                        text="Fase e tipo inferidos automaticamente pela sigla da matéria. Você pode alterar abaixo."
                    />
                )}

                <div className="grid p-fluid">
                    <div className="col-12 md:col-6">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="add-pauta-fase">Fase</label>
                            <Dropdown
                                id="add-pauta-fase"
                                value={fase}
                                options={FASES}
                                onChange={(e) => setFase(e.value as FasePauta)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="add-pauta-tipo">Tipo</label>
                            <Dropdown
                                id="add-pauta-tipo"
                                value={tipo}
                                options={TIPOS}
                                onChange={(e) => setTipo(e.value as TipoPautaItem)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
