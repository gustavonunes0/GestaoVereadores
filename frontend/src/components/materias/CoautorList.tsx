import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import type { AutorSelecionado, CoautorFormItem, TipoAutorMateria } from '../../types/materias';
import {
    autorTipoIcon,
    autorTipoTagLabel,
    resolveAutorDisplayNome,
} from '../../utils/autorMateria';
import { AutorField } from './AutorField';

interface Props {
    value: CoautorFormItem[];
    onChange: (value: CoautorFormItem[]) => void;
    disabled?: boolean;
}

type FiltroCoautor = '' | TipoAutorMateria;

const FILTRO_OPTIONS: Array<{ value: FiltroCoautor; label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'PARLAMENTAR', label: 'Parlamentar' },
    { value: 'TENANT_PARTNER', label: 'Inst. Parceira' },
];

function coautorCompleto(item: CoautorFormItem): item is CoautorFormItem & { selecionado: AutorSelecionado } {
    return item.selecionado != null;
}

export function CoautorList({ value, onChange, disabled = false }: Props) {
    const [filtro, setFiltro] = useState<FiltroCoautor>('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const completos = value.filter(coautorCompleto);
    const pendentes = value.filter((item) => !item.selecionado);

    const visiveis = useMemo(() => {
        if (!filtro) return completos;
        return completos.filter((item) => item.selecionado.tipo === filtro);
    }, [completos, filtro]);

    function atualizar(localId: string, selecionado: AutorSelecionado | null) {
        onChange(
            value.map((item) =>
                item.localId === localId
                    ? {
                          ...item,
                          tipo: selecionado?.tipo ?? '',
                          selecionado,
                      }
                    : item,
            ),
        );
        if (selecionado) setEditingId(null);
    }

    function remover(localId: string) {
        onChange(value.filter((item) => item.localId !== localId));
        if (editingId === localId) setEditingId(null);
    }

    function adicionar() {
        const localId = crypto.randomUUID();
        onChange([
            ...value,
            {
                localId,
                tipo: '',
                selecionado: null,
            },
        ]);
        setEditingId(localId);
    }

    const editingItem = value.find((item) => item.localId === editingId) ?? null;

    return (
        <div>
            <div className="materia-form-secao-header">
                <span className="materia-form-secao-titulo">
                    <i className="pi pi-users" aria-hidden />
                    Coautores
                </span>
                {!disabled && (
                    <div className="flex align-items-center gap-2">
                        <select
                            className="materia-form-coautor-filter"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value as FiltroCoautor)}
                            aria-label="Filtrar coautores"
                        >
                            {FILTRO_OPTIONS.map((opt) => (
                                <option key={opt.label} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <Button
                            type="button"
                            label="Adicionar"
                            icon="pi pi-plus"
                            size="small"
                            outlined
                            className="text-xs"
                            onClick={adicionar}
                        />
                    </div>
                )}
            </div>

            {visiveis.length === 0 && pendentes.length === 0 ? (
                <p className="materia-form-coautor-empty m-0">Nenhum coautor adicionado.</p>
            ) : (
                <div>
                    {visiveis.map((item) => {
                        const sel = item.selecionado;
                        const nome = resolveAutorDisplayNome(sel);
                        const subtitulo =
                            sel.tipo === 'TENANT_PARTNER' && sel.tenantPartnerNome
                                ? sel.tenantPartnerNome
                                : null;
                        return (
                            <div key={item.localId} className="materia-form-coautor-row">
                                <i className={`pi ${autorTipoIcon(sel.tipo)}`} aria-hidden />
                                <span className="materia-form-coautor-nome">
                                    {nome}
                                    {subtitulo ? (
                                        <span className="materia-form-coautor-sub">
                                            {' '}
                                            ({subtitulo})
                                        </span>
                                    ) : null}
                                </span>
                                <span className="materia-form-tipo-tag">
                                    {autorTipoTagLabel(sel.tipo)}
                                </span>
                                {!disabled && (
                                    <Button
                                        type="button"
                                        icon="pi pi-times"
                                        text
                                        rounded
                                        severity="secondary"
                                        className="w-2rem h-2rem"
                                        aria-label="Remover coautor"
                                        onClick={() => remover(item.localId)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {!disabled && editingItem && !editingItem.selecionado && (
                <div className="materia-form-coautor-add-panel">
                    <AutorField
                        value={editingItem.selecionado}
                        onChange={(v) => atualizar(editingItem.localId, v)}
                        labelTipo="Tipo de Coautor *"
                        labelAutor="Coautor *"
                        compact
                    />
                    <div className="flex justify-content-end gap-2 mt-2">
                        <Button
                            type="button"
                            label="Cancelar"
                            size="small"
                            severity="secondary"
                            text
                            onClick={() => remover(editingItem.localId)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
