import { useMemo } from 'react';
import { PesquisaFiltersCard } from '../common/PesquisaFiltersCard';

export type AtosFiltrosForm = {
  tipoId: string;
  classificacaoId: string;
  numero: string;
  dataPubDe: string;
  dataPubAte: string;
};

type DominioItem = { id: string; nome: string };

type Props = {
  filtros: AtosFiltrosForm;
  onChange: (patch: Partial<AtosFiltrosForm>) => void;
  tiposAto: DominioItem[];
  classificacoesAto: DominioItem[];
  onPesquisar: () => void;
  onClear: () => void;
  hasFilters: boolean;
  resultCount?: number;
  searchGeneration?: number;
};

function countActive(f: AtosFiltrosForm) {
  let n = 0;
  if (f.tipoId) n++;
  if (f.classificacaoId) n++;
  if (f.numero.trim()) n++;
  if (f.dataPubDe || f.dataPubAte) n++;
  return n;
}

export function AtosPesquisaFilters({
  filtros,
  onChange,
  tiposAto,
  classificacoesAto,
  onPesquisar,
  onClear,
  hasFilters,
  resultCount,
  searchGeneration,
}: Props) {
  const activeCount = countActive(filtros);

  const chips = useMemo(() => {
    const list: string[] = [];
    const tipo = tiposAto.find((t) => t.id === filtros.tipoId);
    if (tipo) list.push(tipo.nome);
    const cls = classificacoesAto.find((c) => c.id === filtros.classificacaoId);
    if (cls) list.push(cls.nome);
    if (filtros.numero.trim()) list.push(`Nº ${filtros.numero.trim()}`);
    if (filtros.dataPubDe) {
      list.push(`Pub. de ${filtros.dataPubDe.split('-').reverse().join('/')}`);
    }
    if (filtros.dataPubAte) {
      list.push(`Pub. até ${filtros.dataPubAte.split('-').reverse().join('/')}`);
    }
    return list;
  }, [filtros, tiposAto, classificacoesAto]);

  function presetMesAtual() {
    const hoje = new Date();
    const de = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    onChange({
      dataPubDe: de.toISOString().slice(0, 10),
      dataPubAte: hoje.toISOString().slice(0, 10),
    });
  }

  return (
    <PesquisaFiltersCard
      title="Filtros de pesquisa — atos"
      activeCount={activeCount}
      chips={chips}
      hasFilters={hasFilters}
      resultCount={resultCount}
      searchGeneration={searchGeneration}
      onPesquisar={onPesquisar}
      onClear={onClear}
    >
      <div className="sessao-filters-section">
        <p className="sessao-filters-section__title">Classificação</p>
        <div className="sessao-filters-grid sessao-filters-grid--2">
          <label className="filter-field">
            <span className="filter-field__label">Tipo de ato</span>
            <select
              value={filtros.tipoId}
              onChange={(e) => onChange({ tipoId: e.target.value })}
            >
              <option value="">Todos</option>
              {tiposAto.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="filter-field">
            <span className="filter-field__label">Finalidade</span>
            <select
              value={filtros.classificacaoId}
              onChange={(e) => onChange({ classificacaoId: e.target.value })}
            >
              <option value="">Todas</option>
              {classificacoesAto.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="filter-field">
          <span className="filter-field__label">Número</span>
          <input
            value={filtros.numero}
            onChange={(e) => onChange({ numero: e.target.value })}
            placeholder="Ex.: 045/2026"
          />
        </label>
      </div>

      <div className="sessao-filters-section">
        <p className="sessao-filters-section__title">Publicação / vigência</p>
        <div className="sessao-filters-presets">
          <button type="button" className="btn btn-ghost btn-sm" onClick={presetMesAtual}>
            Publicados este mês
          </button>
        </div>
        <div className="sessao-filters-grid sessao-filters-grid--2">
          <label className="filter-field">
            <span className="filter-field__label">Data publicação (de)</span>
            <input
              type="date"
              value={filtros.dataPubDe}
              onChange={(e) => onChange({ dataPubDe: e.target.value })}
            />
          </label>
          <label className="filter-field">
            <span className="filter-field__label">Data publicação (até)</span>
            <input
              type="date"
              value={filtros.dataPubAte}
              onChange={(e) => onChange({ dataPubAte: e.target.value })}
            />
          </label>
        </div>
      </div>
    </PesquisaFiltersCard>
  );
}
