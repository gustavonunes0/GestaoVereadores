import type { PautaItemDetalhe } from '../../../types/sessoes';
import {
    pautaItemDescricao,
    pautaItemRotulo,
    resolvePautaCategoria,
} from '../../../types/sessoes';
import { CategoriaPautaIcon } from './PautaBadges';
import { STATUS_MATERIA_LABELS } from '../../../types/materias';
import type { MateriaStatus } from '../../../types/legislative';

interface Props {
    item: PautaItemDetalhe;
    index: number;
    selected: boolean;
    somenteLeitura: boolean;
    isFirst: boolean;
    isLast: boolean;
    onSelect: () => void;
    onMoverCima: () => void;
    onMoverBaixo: () => void;
}

export function PautaItemCard({
    item,
    index,
    selected,
    somenteLeitura,
    isFirst,
    isLast,
    onSelect,
    onMoverCima,
    onMoverBaixo,
}: Props) {
    const categoria = resolvePautaCategoria(item);
    const rotulo = pautaItemRotulo(item);
    const descricao = pautaItemDescricao(item);
    const emVotacao =
        item.materia?.status === 'EM_VOTACAO' ||
        (item.votacao && !item.votacao.finalizada && !item.votacao.resultado);
    const statusMateriaLabel = item.materia?.status
        ? STATUS_MATERIA_LABELS[item.materia.status as MateriaStatus] ?? item.materia.status
        : null;

    return (
        <div
            className={`pauta-card${selected ? ' pauta-card--selected' : ''}`}
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect();
                }
            }}
            aria-pressed={selected}
            aria-label={`${index + 1}. ${rotulo}`}
        >
            <div className="pauta-card__ord" onClick={(e) => e.stopPropagation()}>
                {!somenteLeitura ? (
                    <>
                        <button
                            type="button"
                            className="pauta-card__ord-btn"
                            disabled={isFirst}
                            onClick={onMoverCima}
                            aria-label="Mover para cima"
                        >
                            <i className="pi pi-chevron-up" aria-hidden />
                        </button>
                        <span className="pauta-card__ord-num">{index + 1}</span>
                        <button
                            type="button"
                            className="pauta-card__ord-btn"
                            disabled={isLast}
                            onClick={onMoverBaixo}
                            aria-label="Mover para baixo"
                        >
                            <i className="pi pi-chevron-down" aria-hidden />
                        </button>
                    </>
                ) : (
                    <span className="pauta-card__ord-num">{index + 1}</span>
                )}
            </div>

            <div className="pauta-card__body">
                <span className="pauta-card__icon">
                    <CategoriaPautaIcon categoria={categoria} />
                </span>
                <div className="pauta-card__text">
                    <span className="pauta-card__rotulo">{rotulo}</span>
                    {descricao ? (
                        <span className="pauta-card__desc">{descricao}</span>
                    ) : null}
                    {emVotacao && statusMateriaLabel ? (
                        <span className="badge badge--warning pauta-card__votando">
                            {statusMateriaLabel}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
