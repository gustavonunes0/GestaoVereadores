import type { PresencaParlamentar } from '../../../types/presenca';
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
    const left = x + 260 > window.innerWidth ? x - 240 : x + 14;
    const top = Math.max(10, y - 10);

    const origemTexto =
        p.origem === 'APP'
            ? 'Registrado pelo aplicativo'
            : p.origem === 'STAFF'
              ? 'Registrado pela secretaria'
              : 'Aguardando registro';

    const situacao = resolveSituacaoCadeira(p);
    const situacaoLabel = LABELS_SITUACAO[situacao];
    const votoLabel =
        situacaoVoto === 'votou'
            ? 'Votou'
            : situacaoVoto === 'nao_votou'
              ? 'Não votou'
              : null;

    return (
        <div className="parlamentar-tooltip" style={{ left, top }}>
            <div className="ptt-head">
                <PersonAvatar
                    photoUrl={p.fotoUrl}
                    name={p.parliamentaryName}
                    size="xl"
                    fallback={p.abreviacao}
                    className="ptt-avatar"
                    aria-hidden
                />
                <div>
                    <div className="ptt-nome">{p.parliamentaryName}</div>
                    {p.cargoMesa && <div className="ptt-cargo">{p.cargoMesa}</div>}
                </div>
            </div>
            <div className="ptt-sub">
                {p.partidoSigla && <>Partido: {p.partidoSigla}</>}
                {p.gabinete && (
                    <>
                        {' '}
                        &middot; Gabinete: {p.gabinete}
                    </>
                )}
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
            <div className="ptt-origem">{origemTexto}</div>
        </div>
    );
}
