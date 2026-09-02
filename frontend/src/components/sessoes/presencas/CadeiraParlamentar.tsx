import type { MouseEvent } from 'react';
import type { PresencaParlamentar } from '../../../types/presenca';
import { LABELS_SITUACAO, resolveSituacaoCadeira, resolveVarianteVisual } from '../../../utils/presencaCadeira';
import { isPresidenteMesa } from '../../../utils/plenarioLayout';
interface CadeiraParlamentarProps {
    parlamentar: PresencaParlamentar;
    podeRegistrar: boolean;
    onToggle: (parlUserId: string) => void;
    onHover: (p: PresencaParlamentar | null, e?: MouseEvent) => void;
    size?: 'sm' | 'md';
}

export function CadeiraParlamentar({
    parlamentar,
    podeRegistrar,
    onToggle,
    onHover,
    size = 'sm',
}: CadeiraParlamentarProps) {
    const situacao = resolveSituacaoCadeira(parlamentar);
    const variante = resolveVarianteVisual(parlamentar);
    const presidente = isPresidenteMesa(parlamentar.cargoMesa);
    const situacaoLabel =
        variante === 'institucional' ? 'Estado/Cadeira' : LABELS_SITUACAO[situacao];
    const handleClick = () => {
        if (podeRegistrar) onToggle(parlamentar.parliamentarianId);
    };

    return (
        <button
            type="button"
            className={[
                'presenca-seat',
                `presenca-seat--${variante}`,
                size === 'md' ? 'presenca-seat--mesa' : '',
                presidente ? 'presenca-seat--presidente' : '',
            ]                .filter(Boolean)
                .join(' ')}
            disabled={!podeRegistrar}
            aria-label={`${parlamentar.parliamentaryName} — ${situacaoLabel}`}
            onClick={handleClick}
            onMouseEnter={(e) => onHover(parlamentar, e)}
            onMouseMove={(e) => onHover(parlamentar, e)}
            onMouseLeave={() => onHover(null)}
        >
            {parlamentar.abreviacao}
        </button>
    );
}
