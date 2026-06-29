import type { PresencaParlamentar, PosicaoCadeira } from '../../../types/presenca';

interface CadeiraParlamentarProps {
    parlamentar: PresencaParlamentar;
    posicao: PosicaoCadeira;
    podeRegistrar: boolean;
    onToggle: (parlUserId: string) => void;
    onHover: (p: PresencaParlamentar | null, e?: React.MouseEvent) => void;
    size?: 'sm' | 'md';
}

const DIMS = {
    sm: { W: 18, BH: 10, SH: 7, LH: 4, LW: 3, font: 5.5 },
    md: { W: 28, BH: 15, SH: 10, LH: 6, LW: 4.5, font: 8.5 },
} as const;

export function CadeiraParlamentar({
    parlamentar,
    posicao,
    podeRegistrar,
    onToggle,
    onHover,
    size = 'sm',
}: CadeiraParlamentarProps) {
    const { x, y, rotacaoGraus } = posicao;
    const { W, BH, SH, LH, LW, font } = DIMS[size];
    const presente = parlamentar.presente;

    const cBack = presente ? '#185FA5' : '#B4B2A9';
    const cSeat = presente ? '#378ADD' : '#C7C5BC';
    const cLeg = presente ? '#0C447C' : '#888780';
    const cStr = presente ? '#0C447C' : '#888780';
    const tr = `rotate(${rotacaoGraus.toFixed(2)}, ${x.toFixed(1)}, ${y.toFixed(1)})`;

    const handleClick = () => {
        if (podeRegistrar) onToggle(parlamentar.parliamentarianId);
    };

    return (
        <g
            transform={tr}
            style={{ cursor: podeRegistrar ? 'pointer' : 'default' }}
            tabIndex={podeRegistrar ? 0 : -1}
            role={podeRegistrar ? 'button' : 'img'}
            aria-label={`${parlamentar.parliamentaryName} — ${presente ? 'presente' : 'ausente'}`}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (podeRegistrar && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleClick();
                }
            }}
            onMouseEnter={(e) => onHover(parlamentar, e)}
            onMouseMove={(e) => onHover(parlamentar, e)}
            onMouseLeave={() => onHover(null)}
            onFocus={(e) => onHover(parlamentar, e as unknown as React.MouseEvent)}
            onBlur={() => onHover(null)}
        >
            {/* pés */}
            <rect
                x={x - W / 2 + 1.5}
                y={y - SH / 2 - LH}
                width={LW}
                height={LH}
                rx={1}
                fill={cLeg}
            />
            <rect
                x={x + W / 2 - 1.5 - LW}
                y={y - SH / 2 - LH}
                width={LW}
                height={LH}
                rx={1}
                fill={cLeg}
            />
            {/* assento — voltado ao centro/mesa */}
            <rect
                x={x - W / 2}
                y={y - SH / 2}
                width={W}
                height={SH}
                rx={2}
                fill={cSeat}
                stroke={cStr}
                strokeWidth={0.5}
            />
            {/* encosto — afastado do centro, vereador olha para a mesa */}
            <rect
                x={x - W / 2}
                y={y + SH / 2}
                width={W}
                height={BH}
                rx={2.5}
                fill={cBack}
                stroke={cStr}
                strokeWidth={0.5}
            />
            {/* iniciais sobre o encosto */}
            <text
                x={x}
                y={y + SH / 2 + BH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={font}
                fontWeight={500}
                fill={presente ? '#ffffff' : '#5F5E5A'}
                pointerEvents="none"
                aria-hidden="true"
            >
                {parlamentar.abreviacao}
            </text>
        </g>
    );
}
