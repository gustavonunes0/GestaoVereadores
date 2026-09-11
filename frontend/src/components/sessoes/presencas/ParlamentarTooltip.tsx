import { createPortal } from 'react-dom';
import type { PresencaParlamentar } from '../../../types/presenca';
import { resolveMateriaTextoOriginalUrl } from '../../../utils/materiaDisplay';
import { LABELS_SITUACAO, resolveSituacaoCadeira } from '../../../utils/presencaCadeira';
import { PersonAvatar } from '../../common/PersonAvatar';

interface TooltipData {
    p: PresencaParlamentar;
    x: number;
    y: number;
}

export function ParlamentarTooltip({
    data,
    situacaoVoto = null,
}: {
    data: TooltipData;
    situacaoVoto?: 'votou' | 'nao_votou' | null;
}) {
    const { p, x, y } = data;
    const width = 260;
    const estimatedHeight = 140;
    const left = Math.min(
        Math.max(12, x + 12),
        Math.max(12, window.innerWidth - width - 12),
    );
    const top = Math.min(
        Math.max(12, y - estimatedHeight / 2),
        Math.max(12, window.innerHeight - estimatedHeight - 12),
    );

    const situacao = resolveSituacaoCadeira(p);
    const situacaoLabel = LABELS_SITUACAO[situacao];
    const votoLabel =
        situacaoVoto === 'votou'
            ? 'Votou'
            : situacaoVoto === 'nao_votou'
              ? 'Não votou'
              : null;

    const fotoUrl = p.fotoUrl?.trim()
        ? resolveMateriaTextoOriginalUrl(p.fotoUrl.trim())
        : undefined;

    return createPortal(
        <div
            className="parlamentar-tooltip"
            style={{ left, top }}
            role="tooltip"
        >
            <div className="ptt-head">
                <PersonAvatar
                    photoUrl={fotoUrl}
                    name={p.parliamentaryName}
                    size="xl"
                    fallback={p.abreviacao}
                    className="ptt-avatar"
                    aria-hidden
                />
                <div className="ptt-info">
                    <div className="ptt-nome">{p.parliamentaryName}</div>
                    {p.cargoMesa && <div className="ptt-cargo">{p.cargoMesa}</div>}
                    {p.partidoSigla && (
                        <div className="ptt-partido">{p.partidoSigla}</div>
                    )}
                </div>
            </div>
            <div
                className={`ptt-status ptt-status--${situacao.toLowerCase()}`}
            >
                <i
                    className={
                        situacao === 'PRESENTE'
                            ? 'pi pi-check-circle'
                            : situacao === 'JUSTIFICADO'
                              ? 'pi pi-info-circle'
                              : situacao === 'PENDENTE'
                                ? 'pi pi-clock'
                                : 'pi pi-times-circle'
                    }
                    aria-hidden
                />
                {situacaoLabel}
            </div>
            {votoLabel ? (
                <div
                    className={`ptt-voto ptt-voto--${situacaoVoto === 'votou' ? 'ok' : 'pendente'}`}
                >
                    {votoLabel}
                </div>
            ) : null}
        </div>,
        document.body,
    );
}
