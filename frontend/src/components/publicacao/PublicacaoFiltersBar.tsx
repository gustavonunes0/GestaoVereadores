import type { ReactNode } from 'react';
import { SiglButton } from '../common/SiglButton';

type Props = {
  children: ReactNode;
  onClear?: () => void;
  showClear?: boolean;
};

/** Barra de filtros compartilhada entre Normas e Atos. */
export function PublicacaoFiltersBar({ children, onClear, showClear }: Props) {
  return (
    <div className="filters-bar publicacao-filters">
      <div className="filters-bar__filters publicacao-filters__fields">{children}</div>
      {showClear && onClear && (
        <div className="filters-bar__actions">
          <SiglButton
            label="Limpar filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            onClick={onClear}
          />
        </div>
      )}
    </div>
  );
}
