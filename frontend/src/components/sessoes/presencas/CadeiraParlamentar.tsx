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
    /**
     * Durante votação aberta: só indica se já registrou voto.
     * Não altera cores de presente/ausente e não revela a opção.
     */
    situacaoVoto?: 'votou' | 'nao_votou' | null;
}

export function CadeiraParlamentar({
    parlamentar,
    podeRegistrar,
    onToggle,
    onHover,
    size = 'sm',
    situacaoVoto = null,
}: CadeiraParlamentarProps) {
    const situacao = resolveSituacaoCadeira(parlamentar);
    const variante = resolveVarianteVisual(parlamentar);
    const presidente = isPresidenteMesa(parlamentar.cargoMesa);
    const situacaoLabel =
        variante === 'institucional' ? 'Estado/Cadeira' : LABELS_SITUACAO[situacao];
    const votoLabel =
        situacaoVoto === 'votou'
            ? 'Votou'
            : situacaoVoto === 'nao_votou'
              ? 'Não votou'
              : null;
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
                situacaoVoto === 'votou' ? 'presenca-seat--votou' : '',
                situacaoVoto === 'nao_votou' ? 'presenca-seat--nao-votou' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            disabled={!podeRegistrar}
            aria-label={[parlamentar.parliamentaryName, situacaoLabel, votoLabel]
                .filter(Boolean)
                .join(' — ')}
            title={[parlamentar.parliamentaryName, situacaoLabel, votoLabel]
                .filter(Boolean)
                .join(' — ')}
            onClick={handleClick}
            onMouseEnter={(e) => onHover(parlamentar, e)}
            onMouseMove={(e) => onHover(parlamentar, e)}
            onMouseLeave={() => onHover(null)}
        >
            {parlamentar.abreviacao}
            {situacaoVoto ? (
                <span
                    className={`presenca-seat__voto-badge presenca-seat__voto-badge--${situacaoVoto === 'votou' ? 'ok' : 'pendente'}`}
                    aria-hidden
                >
                    {situacaoVoto === 'votou' ? '✓' : '·'}
                </span>
            ) : null}
        </button>
    );
}
