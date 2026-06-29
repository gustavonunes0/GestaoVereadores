import { useMemo, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { PesquisaFiltersCard } from '../common/PesquisaFiltersCard';
import { Dropdown, withEmptyOption } from '../ui';
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
    /** Campos apenas — sem card nem botões (uso com FiltroLayout na page) */
    embedded?: boolean;
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
    embedded = false,
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

    const campos = (
        <>
            <div className="sigl-filtro-campo">
                <label htmlFor="sf-legislatura">Legislatura</label>
                <Dropdown
                    id="sf-legislatura"
                    value={filtros.legislaturaId}
                    options={withEmptyOption(
                        legislaturas.map((l) => ({
                            label: `${l.numero}ª legislatura`,
                            value: l.id,
                        })),
                        'Todas',
                    )}
                    onChange={(v) =>
                        onChange({
                            legislaturaId: String(v),
                            sessaoLegislativaId: '',
                        })
                    }
                    placeholder="Todas"
                />
            </div>

            <div className="sigl-filtro-campo">
                <label htmlFor="sf-sessao-leg">Sessão legislativa</label>
                <Dropdown
                    id="sf-sessao-leg"
                    value={filtros.sessaoLegislativaId}
                    options={withEmptyOption(
                        sessoesLeg.map((s) => ({
                            label: `${s.numero}ª sessão legislativa`,
                            value: s.id,
                        })),
                        filtros.legislaturaId
                            ? 'Todas na legislatura'
                            : 'Selecione a legislatura',
                    )}
                    onChange={(v) =>
                        onChange({ sessaoLegislativaId: String(v) })
                    }
                    disabled={!filtros.legislaturaId}
                    placeholder={
                        filtros.legislaturaId
                            ? 'Todas na legislatura'
                            : 'Selecione a legislatura'
                    }
                />
            </div>

            <div className="sigl-filtro-campo">
                <label htmlFor="sf-tipo">Tipo de sessão</label>
                <Dropdown
                    id="sf-tipo"
                    value={filtros.tipoSessaoId}
                    options={withEmptyOption(
                        tiposSessao.map((t) => ({
                            label: t.nome,
                            value: t.id,
                        })),
                        'Todos os tipos',
                    )}
                    onChange={(v) => onChange({ tipoSessaoId: String(v) })}
                    placeholder="Todos os tipos"
                />
            </div>

            <div className="sigl-filtro-campo">
                <label htmlFor="sf-situacao">Situação</label>
                <Dropdown
                    id="sf-situacao"
                    value={filtros.situacaoId}
                    options={withEmptyOption(
                        situacoesSessao.map((s) => ({
                            label: s.nome,
                            value: s.id,
                        })),
                        'Todas as situações',
                    )}
                    onChange={(v) => onChange({ situacaoId: String(v) })}
                    placeholder="Todas as situações"
                />
            </div>

            <div className="sigl-filtro-campo sigl-col-full">
                <div className="sessao-filters-section__row">
                    <span className="filter-field__label">Período da sessão</span>
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
            </div>

            {periodoModo === 'rapido' ? (
                <>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sf-ano">Ano</label>
                        <Dropdown
                            id="sf-ano"
                            value={filtros.ano}
                            options={withEmptyOption(
                                anos.map((a) => ({
                                    label: String(a),
                                    value: String(a),
                                })),
                                'Qualquer',
                            )}
                            onChange={(v) => onChange({ ano: String(v) })}
                            placeholder="Qualquer"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sf-mes">Mês</label>
                        <Dropdown
                            id="sf-mes"
                            value={filtros.mes}
                            options={MESES_OPCOES.map((m) => ({
                                label: m.value
                                    ? (MESES_LABEL[m.value] ?? m.label)
                                    : 'Qualquer',
                                value: m.value,
                            }))}
                            onChange={(v) => onChange({ mes: String(v) })}
                            disabled={!filtros.ano}
                            placeholder="Qualquer"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sf-dia">Dia</label>
                        <InputText
                            id="sf-dia"
                            type="number"
                            min={1}
                            max={31}
                            value={filtros.dia}
                            onChange={(e) => onChange({ dia: e.target.value })}
                            placeholder="—"
                            disabled={!filtros.mes}
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sf-data-de">Data início (de)</label>
                        <InputText
                            id="sf-data-de"
                            type="date"
                            value={filtros.dataDe}
                            onChange={(e) =>
                                onChange({ dataDe: e.target.value })
                            }
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sf-data-ate">Data início (até)</label>
                        <InputText
                            id="sf-data-ate"
                            type="date"
                            value={filtros.dataAte}
                            onChange={(e) =>
                                onChange({ dataAte: e.target.value })
                            }
                        />
                    </div>
                </>
            )}
        </>
    );

    if (embedded) {
        return campos;
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
            <div className="sigl-filtro-campos">{campos}</div>
        </PesquisaFiltersCard>
    );
}
