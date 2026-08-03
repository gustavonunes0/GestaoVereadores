import type { PresencaParlamentar } from '../../../types/presenca';
import { PersonAvatar } from '../../common/PersonAvatar';

interface TooltipData {
    p: PresencaParlamentar;
    x: number;
    y: number;
}

export function ParlamentarTooltip({ data }: { data: TooltipData }) {
    const { p, x, y } = data;
    const left = x + 175 > window.innerWidth ? x - 180 : x + 14;
    const top = Math.max(10, y - 10);

    const origemTexto =
        p.origem === 'APP'
            ? 'Registrado pelo aplicativo'
            : p.origem === 'STAFF'
              ? 'Registrado pela secretaria'
              : 'Aguardando registro';

    return (
        <div className="parlamentar-tooltip" style={{ left, top }}>
            <div className="ptt-head">
                <PersonAvatar
                    photoUrl={p.fotoUrl}
                    name={p.parliamentaryName}
                    size="sm"
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
                className="ptt-status"
                style={{
                    color: p.presente
                        ? 'var(--green-700)'
                        : 'var(--text-color-secondary)',
                }}
            >
                <i
                    className={
                        p.presente ? 'pi pi-check-circle' : 'pi pi-times-circle'
                    }
                />
                {p.presente ? 'Presente' : 'Ausente'}
            </div>
            <div className="ptt-origem">{origemTexto}</div>
        </div>
    );
}
