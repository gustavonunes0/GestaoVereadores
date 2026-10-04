import { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { parlamentaresApi, type Parliamentarian } from '../../../api/legislative/parlamentares.api';
import { substituicoesApi } from '../../../api/legislative/substituicoes.api';
import {
    MOTIVO_SUBSTITUICAO_OPTIONS,
    type MotivoSubstituicao,
    type Substituicao,
} from '../../../types/substituicoes';
import { Dropdown } from '../../ui';
import { dateParaDataCivil, formatarDataCivil } from './data-civil';

export interface SuplenteExercicioValue {
    titularId: string;
    motivo: MotivoSubstituicao | '';
    dataInicio: Date | null;
    dataFim: Date | null;
}

export function suplenteExercicioInicial(): SuplenteExercicioValue {
    return { titularId: '', motivo: '', dataInicio: new Date(), dataFim: null };
}

/** Sem titular escolhido é válido (o vínculo é opcional). */
export function suplenteExercicioValido(v: SuplenteExercicioValue): boolean {
    if (!v.titularId) return true;
    if (!v.motivo || !v.dataInicio) return false;
    return !v.dataFim || v.dataFim.getTime() >= v.dataInicio.getTime();
}

/** Cria a substituição quando um titular foi escolhido; deve rodar depois do mandato de suplente existir. */
export async function registrarExercicioSuplente(
    suplenteId: string,
    v: SuplenteExercicioValue,
): Promise<boolean> {
    if (!v.titularId || !v.motivo || !v.dataInicio) return false;
    await substituicoesApi.create({
        titularId: v.titularId,
        suplenteId,
        motivo: v.motivo,
        dataInicio: dateParaDataCivil(v.dataInicio)!,
        dataFim: dateParaDataCivil(v.dataFim),
    });
    return true;
}

interface Props {
    idPrefix: string;
    legislatureId: string;
    value: SuplenteExercicioValue;
    onChange: (value: SuplenteExercicioValue) => void;
    /** Partido do suplente — titulares do mesmo partido aparecem primeiro. */
    partidoId?: string;
    /** Suplente já cadastrado: exibe a substituição vigente em vez do seletor. */
    suplenteId?: string;
}

export function SuplenteExercicioFields({
    idPrefix,
    legislatureId,
    value,
    onChange,
    partidoId,
    suplenteId,
}: Props) {
    const [titulares, setTitulares] = useState<Parliamentarian[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [vigente, setVigente] = useState<Substituicao | null>(null);

    useEffect(() => {
        if (!legislatureId) {
            setTitulares([]);
            setCarregando(false);
            return;
        }
        setCarregando(true);
        parlamentaresApi
            .listActiveAll({ legislatureId })
            .then((lista) =>
                setTitulares(
                    lista.filter(
                        (p) => p.id !== suplenteId && p.activeMandate?.condicao !== 'SUPLENTE',
                    ),
                ),
            )
            .catch(() => setTitulares([]))
            .finally(() => setCarregando(false));
    }, [legislatureId, suplenteId]);

    useEffect(() => {
        if (!suplenteId) return;
        substituicoesApi
            .listByParlamentar(suplenteId)
            .then((lista) =>
                setVigente(
                    lista.find(
                        (s) =>
                            s.suplente.id === suplenteId &&
                            s.status === 'ATIVA' &&
                            s.situacao !== 'FINALIZADA',
                    ) ?? null,
                ),
            )
            .catch(() => setVigente(null));
    }, [suplenteId]);

    const titularOptions = useMemo(() => {
        const mesmoPartido = (p: Parliamentarian) =>
            !!partidoId && p.user?.politicalParty?.id === partidoId;
        return [...titulares]
            .sort(
                (a, b) =>
                    Number(mesmoPartido(b)) - Number(mesmoPartido(a)) ||
                    a.parliamentaryName.localeCompare(b.parliamentaryName, 'pt-BR'),
            )
            .map((p) => {
                const sigla = p.user?.politicalParty?.acronym;
                return {
                    label: `${p.parliamentaryName}${sigla ? ` (${sigla})` : ''}${mesmoPartido(p) ? ' · mesmo partido' : ''}`,
                    value: p.id,
                };
            });
    }, [titulares, partidoId]);

    const set = (patch: Partial<SuplenteExercicioValue>) => onChange({ ...value, ...patch });
    const periodoValido =
        !value.dataInicio || !value.dataFim || value.dataFim.getTime() >= value.dataInicio.getTime();

    if (vigente) {
        return (
            <div className="sigl-dialog-grid suplente-exercicio-box">
                <div className="suplente-exercicio-box__head">
                    <i className="pi pi-sync" aria-hidden />
                    <span>
                        {vigente.situacao === 'AGENDADA' ? 'Substituição agendada' : 'Em exercício'}:
                        substituindo <strong>{vigente.titular.parliamentaryName}</strong> desde{' '}
                        {formatarDataCivil(vigente.dataInicio)}
                        {vigente.dataFim ? ` até ${formatarDataCivil(vigente.dataFim)}` : ''}.
                    </span>
                </div>
                <small className="text-color-secondary">
                    Para alterar datas ou encerrar, use a seção “Substituições” na visualização do
                    parlamentar.
                </small>
            </div>
        );
    }

    return (
        <div className="sigl-dialog-grid sigl-dialog-grid-2 suplente-exercicio-box">
            <div className="suplente-exercicio-box__head">
                <i className="pi pi-sync" aria-hidden />
                <span>Em exercício no lugar de um titular</span>
            </div>

            <div className="sigl-filtro-campo suplente-exercicio-box__full">
                <label htmlFor={`${idPrefix}-titular`}>Titular substituído</label>
                <Dropdown
                    id={`${idPrefix}-titular`}
                    options={[{ label: '— Nenhum (suplente sem exercício) —', value: '' }, ...titularOptions]}
                    value={value.titularId}
                    onChange={(v) => set({ titularId: String(v) })}
                    placeholder={carregando ? 'Carregando titulares…' : 'Selecione o titular'}
                    disabled={carregando || !legislatureId}
                    className="w-full"
                    filter
                />
                <small className="text-color-secondary">
                    {value.titularId
                        ? 'Durante o período, presença e voto passam do titular para este suplente.'
                        : 'Opcional. Sem titular, o suplente fica cadastrado mas não registra presença nem vota.'}
                </small>
            </div>

            {value.titularId ? (
                <>
                    <div className="sigl-filtro-campo">
                        <label htmlFor={`${idPrefix}-motivo`}>Motivo *</label>
                        <Dropdown
                            id={`${idPrefix}-motivo`}
                            options={MOTIVO_SUBSTITUICAO_OPTIONS}
                            value={value.motivo || null}
                            onChange={(v) => set({ motivo: v as MotivoSubstituicao })}
                            placeholder="Selecione o motivo"
                            className="w-full"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor={`${idPrefix}-inicio`}>Início do exercício *</label>
                        <Calendar
                            id={`${idPrefix}-inicio`}
                            value={value.dataInicio}
                            onChange={(e) => set({ dataInicio: (e.value as Date | null) ?? null })}
                            dateFormat="dd/mm/yy"
                            locale="pt"
                            showIcon
                            placeholder="dd/mm/aaaa"
                            className="w-full"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor={`${idPrefix}-fim`}>Fim do exercício</label>
                        <Calendar
                            id={`${idPrefix}-fim`}
                            value={value.dataFim}
                            onChange={(e) => set({ dataFim: (e.value as Date | null) ?? null })}
                            dateFormat="dd/mm/yy"
                            locale="pt"
                            showIcon
                            showButtonBar
                            placeholder="Sem prazo"
                            minDate={value.dataInicio ?? undefined}
                            className={`w-full${periodoValido ? '' : ' p-invalid'}`}
                        />
                        {!periodoValido ? (
                            <small className="p-error">Deve ser igual ou posterior ao início.</small>
                        ) : null}
                    </div>
                </>
            ) : null}
        </div>
    );
}
