import { useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { FasePautaBadge, TipoPautaBadge } from './PautaBadges';
import type { PautaItemDetalhe } from '../../../types/sessoes';
import {
    pautaMateriaRotulo,
    resolvePautaFase,
    resolvePautaTipo,
} from '../../../types/sessoes';

interface Props {
    item: PautaItemDetalhe;
    index: number;
    somenteLeitura: boolean;
    onMoverCima: () => void;
    onMoverBaixo: () => void;
    onRemover: () => Promise<void>;
    isFirst: boolean;
    isLast: boolean;
}

export function PautaItemRow({
    item,
    index,
    somenteLeitura,
    onMoverCima,
    onMoverBaixo,
    onRemover,
    isFirst,
    isLast,
}: Props) {
    const [confirmando, setConfirmando] = useState(false);
    const [removendo, setRemovendo] = useState(false);
    const publicada = item.status === 'PUBLICADA' || item.status === 'ENCERRADA';
    const rotulo = pautaMateriaRotulo(item.materia);
    const fase = resolvePautaFase(item.fase);
    const tipoPauta = resolvePautaTipo(item.tipoPautaItem);

    async function confirmarRemocao() {
        setRemovendo(true);
        try {
            await onRemover();
        } finally {
            setRemovendo(false);
            setConfirmando(false);
        }
    }

    return (
        <>
            <tr className="data-row">
                <td className="col-ord">
                    <div className="ord-wrap">
                        {!somenteLeitura ? (
                            <>
                                <button
                                    type="button"
                                    className="ord-btn"
                                    disabled={isFirst}
                                    onClick={onMoverCima}
                                    aria-label="Mover para cima"
                                >
                                    <i className="pi pi-chevron-up" aria-hidden />
                                </button>
                                <span className="ord-num">{index + 1}</span>
                                <button
                                    type="button"
                                    className="ord-btn"
                                    disabled={isLast}
                                    onClick={onMoverBaixo}
                                    aria-label="Mover para baixo"
                                >
                                    <i className="pi pi-chevron-down" aria-hidden />
                                </button>
                            </>
                        ) : (
                            <span className="ord-num">{index + 1}</span>
                        )}
                    </div>
                </td>
                <td className="col-mat">
                    <span className="mat-id">{rotulo}</span>
                    <span className="mat-ementa">{item.materia.ementa ?? ''}</span>
                </td>
                <td className="col-fase">
                    <FasePautaBadge fase={fase} />
                </td>
                <td className="col-tipo">
                    <TipoPautaBadge tipo={tipoPauta} />
                </td>
                <td className="col-act">
                    {!somenteLeitura && (
                        <>
                            <Tooltip
                                target={`.btn-remover-${item.id}`}
                                content={publicada ? 'Pauta publicada — remoção bloqueada' : 'Remover'}
                            />
                            <Button
                                icon="pi pi-times"
                                text
                                size="small"
                                severity="danger"
                                className={`btn-remover-${item.id} pauta-remove-btn`}
                                disabled={publicada}
                                onClick={() => setConfirmando(true)}
                                aria-label="Remover item da pauta"
                            />
                        </>
                    )}
                </td>
            </tr>
            {confirmando && (
                <tr className="confirm-row">
                    <td colSpan={5}>
                        <div className="confirm-inner">
                            <i className="pi pi-exclamation-triangle" aria-hidden />
                            <span>
                                Remover <strong>{rotulo}</strong> da pauta?
                            </span>
                            <Button
                                label="Sim, remover"
                                size="small"
                                severity="danger"
                                loading={removendo}
                                onClick={() => void confirmarRemocao()}
                            />
                            <Button
                                label="Não"
                                size="small"
                                severity="secondary"
                                text
                                disabled={removendo}
                                onClick={() => setConfirmando(false)}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
