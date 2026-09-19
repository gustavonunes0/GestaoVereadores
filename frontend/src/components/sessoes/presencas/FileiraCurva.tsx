import type { MouseEvent } from 'react';
import type { AssentoPlenario } from '../../../utils/plenarioLayout';
import { resolveSituacaoCadeira } from '../../../utils/presencaCadeira';
import { CadeiraParlamentar } from './CadeiraParlamentar';
import type { PresencaParlamentar } from '../../../types/presenca';

interface FileiraCurvaProps {
    assentos: AssentoPlenario[];
    rowKey: string;
    rotacaoGraus: number;
    deskRotacaoGraus: number;
    deskWidth: string;
    podeRegistrar: boolean;
    onToggle: (parlUserId: string) => void;
    onHover: (p: PresencaParlamentar | null, e?: MouseEvent) => void;
    idsQueVotaram?: Set<string> | null;
    votacaoAberta?: boolean;
}

export function FileiraCurva({
    assentos,
    rotacaoGraus,
    deskRotacaoGraus,
    deskWidth,
    podeRegistrar,
    onToggle,
    onHover,
    idsQueVotaram = null,
    votacaoAberta = false,
}: FileiraCurvaProps) {
    const ocupados = assentos.filter((a): a is PresencaParlamentar => a != null);

    if (ocupados.length === 0) return null;

    return (
        <div
            className="presenca-curved-row"
            style={{ transform: `rotate(${rotacaoGraus}deg)` }}
        >
            <div
                className="presenca-desk-curve"
                style={{
                    width: deskWidth,
                    transform: `translateX(-50%) rotate(${deskRotacaoGraus}deg)`,
                }}
                aria-hidden
            />
            {ocupados.map((assento) => (
                <CadeiraParlamentar
                    key={assento.parliamentarianId}
                    parlamentar={assento}
                    podeRegistrar={podeRegistrar}
                    onToggle={onToggle}
                    onHover={onHover}
                    situacaoVoto={
                        votacaoAberta &&
                        idsQueVotaram &&
                        resolveSituacaoCadeira(assento) === 'PRESENTE'
                            ? idsQueVotaram.has(assento.parliamentarianId)
                                ? 'votou'
                                : 'nao_votou'
                            : null
                    }
                />
            ))}
        </div>
    );
}
