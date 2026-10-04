import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { substituicoesApi } from '../../../api/legislative/substituicoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import { usePermissions } from '../../../hooks/usePermissions';
import type {
    AcaoSubstituicaoHistorico,
    SituacaoSubstituicao,
    Substituicao,
    SubstituicaoHistorico,
} from '../../../types/substituicoes';
import { formatarDataCivil } from './data-civil';
import { SubstituicaoFormDialog } from './SubstituicaoFormDialog';

const SITUACAO_LABEL: Record<SituacaoSubstituicao, string> = {
    AGENDADA: 'Agendada',
    EM_EXERCICIO: 'Em exercício',
    FINALIZADA: 'Encerrada',
    CANCELADA: 'Cancelada',
};

const SITUACAO_SEV: Record<SituacaoSubstituicao, 'success' | 'info' | 'secondary' | 'warning'> = {
    AGENDADA: 'info',
    EM_EXERCICIO: 'success',
    FINALIZADA: 'secondary',
    CANCELADA: 'warning',
};

const ACAO_LABEL: Record<AcaoSubstituicaoHistorico, string> = {
    CRIADA: 'Vinculação criada',
    DATAS_ALTERADAS: 'Dados alterados',
    ENCERRADA: 'Substituição encerrada',
    CANCELADA: 'Substituição cancelada',
};

const CAMPO_LABEL: Record<string, string> = {
    dataInicio: 'Início',
    dataFim: 'Fim',
    observacao: 'Observação',
    status: 'Status',
};

function descreverValor(campo: string, valor: unknown): string {
    if (valor == null || valor === '') return campo === 'dataFim' ? 'sem prazo' : '—';
    if (campo === 'dataInicio' || campo === 'dataFim') return formatarDataCivil(String(valor));
    return String(valor);
}

function descreverAlteracoes(h: SubstituicaoHistorico): string[] {
    if (!h.alteracoes || h.acao === 'CRIADA') return [];
    return Object.entries(h.alteracoes).flatMap(([campo, mudanca]) => {
        const m = mudanca as { antes?: unknown; depois?: unknown } | null;
        if (!m || typeof m !== 'object' || !('depois' in m)) return [];
        return [
            `${CAMPO_LABEL[campo] ?? campo}: ${descreverValor(campo, m.antes)} → ${descreverValor(campo, m.depois)}`,
        ];
    });
}

function formatarDataHora(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

interface Props {
    parlamentar: { id: string; parliamentaryName: string };
    /** Mandato ativo como titular — habilita "Vincular suplente". */
    podeTerSuplente: boolean;
    onChanged?: () => void;
}

export function ParlamentarSubstituicoesSection({ parlamentar, podeTerSuplente, onChanged }: Props) {
    const { showSuccess, showApiError, confirmDestructive } = useAppToast();
    const { canWrite } = usePermissions();
    const [items, setItems] = useState<Substituicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<{ substituicao?: Substituicao } | null>(null);
    const [historicoAberto, setHistoricoAberto] = useState<string | null>(null);
    const [historico, setHistorico] = useState<SubstituicaoHistorico[]>([]);

    const carregar = useCallback(() => {
        setLoading(true);
        substituicoesApi
            .listByParlamentar(parlamentar.id)
            .then(setItems)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [parlamentar.id, showApiError]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const alternarHistorico = (id: string) => {
        if (historicoAberto === id) {
            setHistoricoAberto(null);
            return;
        }
        setHistoricoAberto(id);
        setHistorico([]);
        substituicoesApi.historico(id).then(setHistorico).catch(showApiError);
    };

    const encerrar = (s: Substituicao) => {
        confirmDestructive(
            s.situacao === 'AGENDADA'
                ? `Cancelar a substituição de ${s.titular.parliamentaryName} por ${s.suplente.parliamentaryName}? Ela ainda não começou.`
                : `Encerrar a substituição? ${s.titular.parliamentaryName} volta a exercer o mandato hoje. Em sessão já aberta, vale a partir da próxima sessão.`,
            async () => {
                try {
                    await substituicoesApi.encerrar(s.id);
                    showSuccess('Substituição encerrada.');
                    carregar();
                    if (historicoAberto === s.id) alternarHistorico(s.id);
                    onChanged?.();
                } catch (err) {
                    showApiError(err);
                }
            },
            'Encerrar substituição',
        );
    };

    return (
        <div className="sigl-dialog-secao">
            <div className="flex align-items-center justify-content-between gap-2">
                <span className="sigl-dialog-secao-titulo">
                    <i className="pi pi-sync" aria-hidden />
                    Substituições
                </span>
                {canWrite && podeTerSuplente ? (
                    <Button
                        label="Vincular suplente"
                        icon="pi pi-user-plus"
                        size="small"
                        outlined
                        onClick={() => setForm({})}
                    />
                ) : null}
            </div>

            {loading ? (
                <p className="text-color-secondary m-0 parlamentar-ver-full">Carregando…</p>
            ) : items.length === 0 ? (
                <p className="text-color-secondary m-0 parlamentar-ver-full">
                    Nenhuma substituição registrada.
                </p>
            ) : (
                <ul className="parlamentar-ver-mandatos parlamentar-ver-full">
                    {items.map((s) => {
                        const comoTitular = s.titular.id === parlamentar.id;
                        const editavel = canWrite && s.status === 'ATIVA';
                        return (
                            <li key={s.id} className="parlamentar-ver-mandato">
                                <div className="parlamentar-ver-mandato__head">
                                    <strong>
                                        {comoTitular
                                            ? `Substituído por ${s.suplente.parliamentaryName}`
                                            : `Substituindo ${s.titular.parliamentaryName}`}
                                    </strong>
                                    <div className="parlamentar-ver-mandato__tags">
                                        <Tag value={s.motivo.label} severity="info" />
                                        <Tag
                                            value={SITUACAO_LABEL[s.situacao]}
                                            severity={SITUACAO_SEV[s.situacao]}
                                        />
                                    </div>
                                </div>
                                <div className="parlamentar-ver-acesso__meta">
                                    <div className="parlamentar-ver-field">
                                        <span className="sigl-field-label">Início</span>
                                        <p className="parlamentar-ver-value">
                                            {formatarDataCivil(s.dataInicio)}
                                        </p>
                                    </div>
                                    <div className="parlamentar-ver-field">
                                        <span className="sigl-field-label">Fim</span>
                                        <p className="parlamentar-ver-value">
                                            {s.dataFim ? formatarDataCivil(s.dataFim) : 'Sem prazo'}
                                        </p>
                                    </div>
                                    {s.observacao ? (
                                        <div className="parlamentar-ver-field parlamentar-ver-field--wide">
                                            <span className="sigl-field-label">Observação</span>
                                            <p className="parlamentar-ver-value">{s.observacao}</p>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {editavel ? (
                                        <>
                                            <Button
                                                label="Editar datas"
                                                icon="pi pi-calendar"
                                                size="small"
                                                text
                                                onClick={() => setForm({ substituicao: s })}
                                            />
                                            <Button
                                                label="Encerrar"
                                                icon="pi pi-stop-circle"
                                                size="small"
                                                text
                                                severity="danger"
                                                onClick={() => encerrar(s)}
                                            />
                                        </>
                                    ) : null}
                                    <Button
                                        label={historicoAberto === s.id ? 'Ocultar histórico' : 'Histórico'}
                                        icon="pi pi-history"
                                        size="small"
                                        text
                                        severity="secondary"
                                        onClick={() => alternarHistorico(s.id)}
                                    />
                                </div>
                                {historicoAberto === s.id ? (
                                    <ul className="m-0 mt-2 pl-3 text-sm">
                                        {historico.length === 0 ? (
                                            <li className="text-color-secondary">Carregando…</li>
                                        ) : (
                                            historico.map((h) => (
                                                <li key={h.id} className="mb-1">
                                                    <strong>{ACAO_LABEL[h.acao]}</strong> ·{' '}
                                                    {formatarDataHora(h.dataHora)}
                                                    {h.responsavel ? ` · ${h.responsavel.nome}` : ''}
                                                    {descreverAlteracoes(h).map((linha) => (
                                                        <div key={linha} className="text-color-secondary">
                                                            {linha}
                                                        </div>
                                                    ))}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            )}

            {form ? (
                <SubstituicaoFormDialog
                    titular={form.substituicao?.titular ?? parlamentar}
                    substituicao={form.substituicao}
                    onClose={() => setForm(null)}
                    onSaved={() => {
                        setForm(null);
                        carregar();
                        onChanged?.();
                    }}
                />
            ) : null}
        </div>
    );
}
