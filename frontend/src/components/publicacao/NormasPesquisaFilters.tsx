import { useMemo } from 'react';
import { PesquisaFiltersCard } from '../common/PesquisaFiltersCard';

export type NormasFiltrosForm = {
    tipoId: string;
    anoId: string;
    numero: string;
    dataPubDe: string;
    dataPubAte: string;
};

type DominioItem = { id: string; nome: string };
type AnoItem = { id: string; valor: number };

type Props = {
    filtros: NormasFiltrosForm;
    onChange: (patch: Partial<NormasFiltrosForm>) => void;
    tiposNorma: DominioItem[];
    anos: AnoItem[];
    onPesquisar: () => void;
    onClear: () => void;
    hasFilters: boolean;
    resultCount?: number;
    searchGeneration?: number;
};

function countActive(f: NormasFiltrosForm) {
    let n = 0;
    if (f.tipoId) n++;
    if (f.anoId) n++;
    if (f.numero.trim()) n++;
    if (f.dataPubDe || f.dataPubAte) n++;
    return n;
}

export function NormasPesquisaFilters({
    filtros,
    onChange,
    tiposNorma,
    anos,
    onPesquisar,
    onClear,
    hasFilters,
    resultCount,
    searchGeneration,
}: Props) {
    const activeCount = countActive(filtros);

    const chips = useMemo(() => {
        const list: string[] = [];
        const tipo = tiposNorma.find((t) => t.id === filtros.tipoId);
        if (tipo) list.push(tipo.nome);
        const ano = anos.find((a) => a.id === filtros.anoId);
        if (ano) list.push(`Ano ${ano.valor}`);
        if (filtros.numero.trim()) list.push(`Nº ${filtros.numero.trim()}`);
        if (filtros.dataPubDe) {
            list.push(
                `Pub. de ${filtros.dataPubDe.split('-').reverse().join('/')}`,
            );
        }
        if (filtros.dataPubAte) {
            list.push(
                `Pub. até ${filtros.dataPubAte.split('-').reverse().join('/')}`,
            );
        }
        return list;
    }, [filtros, tiposNorma, anos]);

    function presetAnoAtual() {
        const anoAtual = String(new Date().getFullYear());
        const match = anos.find((a) => String(a.valor) === anoAtual);
        onChange({
            anoId: match?.id ?? '',
            dataPubDe: '',
            dataPubAte: '',
        });
    }

    function presetMesAtual() {
        const hoje = new Date();
        const de = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        onChange({
            dataPubDe: de.toISOString().slice(0, 10),
            dataPubAte: hoje.toISOString().slice(0, 10),
            anoId: '',
        });
    }

    return (
        <PesquisaFiltersCard
            title="Filtros de pesquisa — normas"
            activeCount={activeCount}
            chips={chips}
            hasFilters={hasFilters}
            resultCount={resultCount}
            searchGeneration={searchGeneration}
            onPesquisar={onPesquisar}
            onClear={onClear}
        >
            <div className="sessao-filters-section">
                <p className="sessao-filters-section__title">Identificação</p>
                <div className="sessao-filters-grid sessao-filters-grid--3">
                    <label className="filter-field">
                        <span className="filter-field__label">
                            Espécie normativa
                        </span>
                        <select
                            value={filtros.tipoId}
                            onChange={(e) =>
                                onChange({ tipoId: e.target.value })
                            }
                        >
                            <option value="">Todas</option>
                            {tiposNorma.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nome}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="filter-field">
                        <span className="filter-field__label">Ano</span>
                        <select
                            value={filtros.anoId}
                            onChange={(e) =>
                                onChange({ anoId: e.target.value })
                            }
                        >
                            <option value="">Todos</option>
                            {anos.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.valor}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="filter-field">
                        <span className="filter-field__label">Número</span>
                        <input
                            value={filtros.numero}
                            onChange={(e) =>
                                onChange({ numero: e.target.value })
                            }
                            placeholder="Ex.: 123"
                        />
                    </label>
                </div>
            </div>

            <div className="sessao-filters-section">
                <p className="sessao-filters-section__title">Publicação</p>
                <div className="sessao-filters-presets">
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={presetMesAtual}
                    >
                        Publicadas este mês
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={presetAnoAtual}
                    >
                        Ano vigente
                    </button>
                </div>
                <div className="sessao-filters-grid sessao-filters-grid--2">
                    <label className="filter-field">
                        <span className="filter-field__label">
                            Data publicação (de)
                        </span>
                        <input
                            type="date"
                            value={filtros.dataPubDe}
                            onChange={(e) =>
                                onChange({ dataPubDe: e.target.value })
                            }
                        />
                    </label>
                    <label className="filter-field">
                        <span className="filter-field__label">
                            Data publicação (até)
                        </span>
                        <input
                            type="date"
                            value={filtros.dataPubAte}
                            onChange={(e) =>
                                onChange({ dataPubAte: e.target.value })
                            }
                        />
                    </label>
                </div>
            </div>
        </PesquisaFiltersCard>
    );
}
