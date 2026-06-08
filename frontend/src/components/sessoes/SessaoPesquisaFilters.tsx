import { useMemo, useState } from 'react';
import { PesquisaFiltersCard } from '../common/PesquisaFiltersCard';
import { MESES_OPCOES, anosPesquisaSessao } from '../../utils/sessaoPesquisa';

export type SessaoFiltrosForm = {
    legislaturaId: string;
    sessaoLegislativaId: string;
    ano: string;
    mes: string;
    dia: string;
    dataDe: string;
    dataAte: string;
    tipoSessaoId: string;
    situacaoId: string;
};

type DominioItem = { id: string; nome: string };

type Props = {
    filtros: SessaoFiltrosForm;
    onChange: (patch: Partial<SessaoFiltrosForm>) => void;
    legislaturas: {
        id: string;
        numero: number;
        sessoesLegislativas?: { id: string; numero: number }[];
    }[];
    tiposSessao: DominioItem[];
    situacoesSessao: DominioItem[];
    onPesquisar: () => void;
    onClear: () => void;
    hasFilters: boolean;
    resultCount?: number;
    /** Incrementa após cada pesquisa para recolher o painel */
    searchGeneration?: number;
};

type PeriodoModo = 'rapido' | 'intervalo';

const MESES_LABEL: Record<string, string> = {
    '1': 'Jan',
    '2': 'Fev',
    '3': 'Mar',
    '4': 'Abr',
    '5': 'Mai',
    '6': 'Jun',
    '7': 'Jul',
    '8': 'Ago',
    '9': 'Set',
    '10': 'Out',
    '11': 'Nov',
    '12': 'Dez',
};

function countActiveFilters(f: SessaoFiltrosForm): number {
    let n = 0;
    if (f.legislaturaId) n++;
    if (f.sessaoLegislativaId) n++;
    if (f.ano || f.mes || f.dia) n++;
    if (f.dataDe || f.dataAte) n++;
    if (f.tipoSessaoId) n++;
    if (f.situacaoId) n++;
    return n;
}

export function SessaoPesquisaFilters({
    filtros,
    onChange,
    legislaturas,
    tiposSessao,
    situacoesSessao,
    onPesquisar,
    onClear,
    hasFilters,
    resultCount,
    searchGeneration = 0,
}: Props) {
    const [periodoModo, setPeriodoModoState] = useState<PeriodoModo>(() =>
        filtros.dataDe || filtros.dataAte ? 'intervalo' : 'rapido',
    );

    const leg = legislaturas.find((l) => l.id === filtros.legislaturaId);
    const sessoesLeg = leg?.sessoesLegislativas ?? [];
    const anos = anosPesquisaSessao();
    const activeCount = countActiveFilters(filtros);

    const chips = useMemo(() => {
        const list: string[] = [];
        if (leg) list.push(`${leg.numero}ª legislatura`);
        const sl = sessoesLeg.find((s) => s.id === filtros.sessaoLegislativaId);
        if (sl) list.push(`${sl.numero}ª sessão legislativa`);
        if (periodoModo === 'rapido' && filtros.ano) {
            let p = filtros.ano;
            if (filtros.mes)
                p += ` · ${MESES_LABEL[filtros.mes] ?? filtros.mes}`;
            if (filtros.dia) p += `/${filtros.dia}`;
            list.push(p);
        }
        if (periodoModo === 'intervalo') {
            if (filtros.dataDe)
                list.push(
                    `De ${filtros.dataDe.split('-').reverse().join('/')}`,
                );
            if (filtros.dataAte)
                list.push(
                    `Até ${filtros.dataAte.split('-').reverse().join('/')}`,
                );
        }
        const tipo = tiposSessao.find((t) => t.id === filtros.tipoSessaoId);
        if (tipo) list.push(tipo.nome);
        const sit = situacoesSessao.find((s) => s.id === filtros.situacaoId);
        if (sit) list.push(sit.nome);
        return list;
    }, [filtros, leg, sessoesLeg, periodoModo, tiposSessao, situacoesSessao]);

    function changePeriodoModo(modo: PeriodoModo) {
        setPeriodoModoState(modo);
        if (modo === 'rapido') {
            onChange({ dataDe: '', dataAte: '' });
        } else {
            onChange({ ano: '', mes: '', dia: '' });
        }
    }

    function aplicarPreset(preset: 'ano' | 'mes' | '30dias') {
        const hoje = new Date();
        if (preset === 'ano') {
            onChange({
                ano: String(hoje.getFullYear()),
                mes: '',
                dia: '',
                dataDe: '',
                dataAte: '',
            });
            setPeriodoModoState('rapido');
            return;
        }
        if (preset === 'mes') {
            onChange({
                ano: String(hoje.getFullYear()),
                mes: String(hoje.getMonth() + 1),
                dia: '',
                dataDe: '',
                dataAte: '',
            });
            setPeriodoModoState('rapido');
            return;
        }
        const de = new Date(hoje);
        de.setDate(de.getDate() - 30);
        onChange({
            ano: '',
            mes: '',
            dia: '',
            dataDe: de.toISOString().slice(0, 10),
            dataAte: hoje.toISOString().slice(0, 10),
        });
        setPeriodoModoState('intervalo');
    }

    return (
        <PesquisaFiltersCard
            title="Filtros de pesquisa — sessões"
            activeCount={activeCount}
            chips={chips}
            hasFilters={hasFilters}
            resultCount={resultCount}
            searchGeneration={searchGeneration}
            onPesquisar={onPesquisar}
            onClear={onClear}
        >
            <div className="sessao-filters-section">
                <p className="sessao-filters-section__title">Contexto</p>
                <div className="sessao-filters-grid sessao-filters-grid--2">
                    <label className="filter-field">
                        <span className="filter-field__label">Legislatura</span>
                        <select
                            value={filtros.legislaturaId}
                            onChange={(e) =>
                                onChange({
                                    legislaturaId: e.target.value,
                                    sessaoLegislativaId: '',
                                })
                            }
                        >
                            <option value="">Todas</option>
                            {legislaturas.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.numero}ª legislatura
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="filter-field">
                        <span className="filter-field__label">
                            Sessão legislativa
                        </span>
                        <select
                            value={filtros.sessaoLegislativaId}
                            onChange={(e) =>
                                onChange({
                                    sessaoLegislativaId: e.target.value,
                                })
                            }
                            disabled={!filtros.legislaturaId}
                        >
                            <option value="">
                                {filtros.legislaturaId
                                    ? 'Todas na legislatura'
                                    : 'Selecione a legislatura'}
                            </option>
                            {sessoesLeg.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.numero}ª sessão legislativa
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            <div className="sessao-filters-section">
                <div className="sessao-filters-section__row">
                    <p className="sessao-filters-section__title">
                        Período da sessão
                    </p>
                    <div
                        className="segmented"
                        role="tablist"
                        aria-label="Modo de período"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={periodoModo === 'rapido'}
                            className={`segmented__btn${periodoModo === 'rapido' ? ' segmented__btn--active' : ''}`}
                            onClick={() => changePeriodoModo('rapido')}
                        >
                            Ano / mês / dia
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={periodoModo === 'intervalo'}
                            className={`segmented__btn${periodoModo === 'intervalo' ? ' segmented__btn--active' : ''}`}
                            onClick={() => changePeriodoModo('intervalo')}
                        >
                            Intervalo
                        </button>
                    </div>
                </div>

                <div className="sessao-filters-presets">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => aplicarPreset('mes')}
                    >
                        Este mês
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => aplicarPreset('ano')}
                    >
                        Este ano
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => aplicarPreset('30dias')}
                    >
                        Últimos 30 dias
                    </button>
                </div>

                {periodoModo === 'rapido' ? (
                    <div className="sessao-filters-grid sessao-filters-grid--3">
                        <label className="filter-field">
                            <span className="filter-field__label">Ano</span>
                            <select
                                value={filtros.ano}
                                onChange={(e) =>
                                    onChange({ ano: e.target.value })
                                }
                            >
                                <option value="">Qualquer</option>
                                {anos.map((a) => (
                                    <option key={a} value={String(a)}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="filter-field">
                            <span className="filter-field__label">Mês</span>
                            <select
                                value={filtros.mes}
                                onChange={(e) =>
                                    onChange({ mes: e.target.value })
                                }
                                disabled={!filtros.ano}
                            >
                                {MESES_OPCOES.map((m) => (
                                    <option
                                        key={m.value || 'v'}
                                        value={m.value}
                                    >
                                        {m.value
                                            ? (MESES_LABEL[m.value] ?? m.label)
                                            : 'Qualquer'}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="filter-field">
                            <span className="filter-field__label">Dia</span>
                            <input
                                type="number"
                                min={1}
                                max={31}
                                value={filtros.dia}
                                onChange={(e) =>
                                    onChange({ dia: e.target.value })
                                }
                                placeholder="—"
                                disabled={!filtros.mes}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="sessao-filters-grid sessao-filters-grid--2">
                        <label className="filter-field">
                            <span className="filter-field__label">
                                Data início (de)
                            </span>
                            <input
                                type="date"
                                value={filtros.dataDe}
                                onChange={(e) =>
                                    onChange({ dataDe: e.target.value })
                                }
                            />
                        </label>
                        <label className="filter-field">
                            <span className="filter-field__label">
                                Data início (até)
                            </span>
                            <input
                                type="date"
                                value={filtros.dataAte}
                                onChange={(e) =>
                                    onChange({ dataAte: e.target.value })
                                }
                            />
                        </label>
                    </div>
                )}
            </div>

            <div className="sessao-filters-section">
                <p className="sessao-filters-section__title">Classificação</p>
                <div className="sessao-filters-grid sessao-filters-grid--2">
                    <label className="filter-field">
                        <span className="filter-field__label">
                            Tipo de sessão
                        </span>
                        <select
                            value={filtros.tipoSessaoId}
                            onChange={(e) =>
                                onChange({ tipoSessaoId: e.target.value })
                            }
                        >
                            <option value="">Todos os tipos</option>
                            {tiposSessao.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nome}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="filter-field">
                        <span className="filter-field__label">Situação</span>
                        <select
                            value={filtros.situacaoId}
                            onChange={(e) =>
                                onChange({ situacaoId: e.target.value })
                            }
                        >
                            <option value="">Todas as situações</option>
                            {situacoesSessao.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nome}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </PesquisaFiltersCard>
    );
}
