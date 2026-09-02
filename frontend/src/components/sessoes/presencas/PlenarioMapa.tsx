import { useMemo, useState, type MouseEvent } from 'react';
import type { PresencaParlamentar, PresencaSessao } from '../../../types/presenca';
import { calcularParesFileiras, preencherMesa } from '../../../utils/plenarioLayout';
import { CadeiraParlamentar } from './CadeiraParlamentar';
import { CadeiraVazia } from './CadeiraVazia';
import { FileiraCurva } from './FileiraCurva';
import { ParlamentarTooltip } from './ParlamentarTooltip';
import { PresencaLegenda } from './PresencaLegenda';
import { QuorumBar } from './QuorumBar';

interface PlenarioMapaProps {
    presenca: PresencaSessao;
    podeRegistrar: boolean;
    onToggle: (parlUserId: string) => void;
}

function vereadoresNoPlenario(presenca: PresencaSessao): PresencaParlamentar[] {
    const idsMesa = new Set(
        presenca.mesaMembros.flatMap((m) => [m.parliamentarianId, m.parlamentarianUserId]),
    );
    return presenca.vereadores.filter(
        (v) => !idsMesa.has(v.parliamentarianId) && !idsMesa.has(v.parlamentarianUserId),
    );
}

export function PlenarioMapa({ presenca, podeRegistrar, onToggle }: PlenarioMapaProps) {
    const [tooltip, setTooltip] = useState<{
        p: PresencaParlamentar;
        x: number;
        y: number;
    } | null>(null);

    const vereadores = useMemo(() => vereadoresNoPlenario(presenca), [presenca]);
    const paresFileiras = useMemo(() => calcularParesFileiras(vereadores), [vereadores]);
    const assentosMesa = useMemo(() => preencherMesa(presenca.mesaMembros), [presenca.mesaMembros]);

    const handleHover = (p: PresencaParlamentar | null, e?: MouseEvent) => {
        if (!p || !e) {
            setTooltip(null);
            return;
        }
        setTooltip({ p, x: e.clientX, y: e.clientY });
    };

    return (
        <div className="plenario-card lex-presenca-map">
            <div className="plenario-card__canvas">
                <div className="presenca-plenario" role="img" aria-label="Mapa de presenças do plenário">
                    <div className="presenca-plenario__hemicycle" aria-hidden />

                    <div className="presenca-mesa">
                        <div className="presenca-mesa__chairs">
                            {assentosMesa.map((assento, i) =>
                                assento ? (
                                    <CadeiraParlamentar
                                        key={assento.parliamentarianId}
                                        parlamentar={assento}
                                        podeRegistrar={podeRegistrar}
                                        onToggle={onToggle}
                                        onHover={handleHover}
                                        size="md"
                                    />
                                ) : (
                                    <CadeiraVazia key={`mesa-vazia-${i}`} size="md" />
                                ),
                            )}
                        </div>
                        <div className="presenca-mesa__bar">Mesa Diretora</div>
                        <div className="presenca-mesa__side presenca-mesa__side--left" aria-hidden />
                        <div className="presenca-mesa__side presenca-mesa__side--right" aria-hidden />
                    </div>

                    <div className="presenca-fileiras">
                        {paresFileiras.map((par) => (
                            <div
                                key={par.indice}
                                className="presenca-fileira-par"
                                style={{
                                    paddingLeft: par.paddingPx,
                                    paddingRight: par.paddingPx,
                                }}
                            >
                                <FileiraCurva
                                    assentos={par.esquerda}
                                    rowKey={`f${par.indice}-e`}
                                    rotacaoGraus={par.rotacaoEsq}
                                    deskRotacaoGraus={par.deskRotEsq}
                                    deskWidth={par.deskWidth}
                                    podeRegistrar={podeRegistrar}
                                    onToggle={onToggle}
                                    onHover={handleHover}
                                />
                                <FileiraCurva
                                    assentos={par.direita}
                                    rowKey={`f${par.indice}-d`}
                                    rotacaoGraus={par.rotacaoDir}
                                    deskRotacaoGraus={par.deskRotDir}
                                    deskWidth={par.deskWidth}
                                    podeRegistrar={podeRegistrar}
                                    onToggle={onToggle}
                                    onHover={handleHover}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <QuorumBar presenca={presenca} />
            <PresencaLegenda />

            {tooltip && <ParlamentarTooltip data={tooltip} />}
        </div>
    );
}
