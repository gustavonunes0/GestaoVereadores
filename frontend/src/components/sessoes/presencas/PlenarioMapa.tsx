import { useMemo, useState } from 'react';
import type { PresencaParlamentar, PresencaSessao } from '../../../types/presenca';
import {
    MESA_LAYOUT,
    PLENARIO_VIEWBOX,
    calcularPosicoes,
    calcularPosicoesMesa,
} from '../../../utils/plenarioLayout';
import { CadeiraParlamentar } from './CadeiraParlamentar';
import { ParlamentarTooltip } from './ParlamentarTooltip';
import { QuorumBar } from './QuorumBar';

interface PlenarioMapaProps {
    presenca: PresencaSessao;
    podeRegistrar: boolean;
    onToggle: (parlUserId: string) => void;
}

const { w: VB_W, h: VB_H } = PLENARIO_VIEWBOX;
const { x: MESA_X, y: MESA_Y, w: MESA_W, h: MESA_H } = MESA_LAYOUT;

export function PlenarioMapa({ presenca, podeRegistrar, onToggle }: PlenarioMapaProps) {
    const [tooltip, setTooltip] = useState<{
        p: PresencaParlamentar;
        x: number;
        y: number;
    } | null>(null);

    const posicoesMesa = useMemo(
        () => calcularPosicoesMesa(presenca.mesaMembros.length),
        [presenca.mesaMembros.length],
    );

    const posicoesVereadores = useMemo(
        () => calcularPosicoes(presenca.vereadores.length),
        [presenca.vereadores.length],
    );

    const handleHover = (p: PresencaParlamentar | null, e?: React.MouseEvent) => {
        if (!p || !e) {
            setTooltip(null);
            return;
        }
        setTooltip({ p, x: e.clientX, y: e.clientY });
    };

    return (
        <div className="plenario-card">
            <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="plenario-svg"
                role="img"
                aria-label="Mapa de presenças do plenário"
            >
                {/* Mesa diretora */}
                <rect
                    x={MESA_X}
                    y={MESA_Y}
                    width={MESA_W}
                    height={MESA_H}
                    rx={10}
                    fill="#B98F38"
                    stroke="#8A6A22"
                    strokeWidth={1.5}
                />
                <rect
                    x={MESA_X + 8}
                    y={MESA_Y + 8}
                    width={MESA_W - 16}
                    height={MESA_H - 16}
                    rx={6}
                    fill="#CDA94E"
                />

                {/* Cadeiras da mesa diretora */}
                {presenca.mesaMembros.map((p, i) =>
                    posicoesMesa[i] ? (
                        <CadeiraParlamentar
                            key={p.parliamentarianId}
                            parlamentar={p}
                            posicao={posicoesMesa[i]}
                            podeRegistrar={podeRegistrar}
                            onToggle={onToggle}
                            onHover={handleHover}
                            size="md"
                        />
                    ) : null,
                )}

                {/* Semicírculo — vereadores (fora da mesa) */}
                {presenca.vereadores.map((p, i) =>
                    posicoesVereadores[i] ? (
                        <CadeiraParlamentar
                            key={p.parliamentarianId}
                            parlamentar={p}
                            posicao={posicoesVereadores[i]}
                            podeRegistrar={podeRegistrar}
                            onToggle={onToggle}
                            onHover={handleHover}
                            size="md"
                        />
                    ) : null,
                )}
            </svg>

            <QuorumBar presenca={presenca} />

            {tooltip && <ParlamentarTooltip data={tooltip} />}
        </div>
    );
}
