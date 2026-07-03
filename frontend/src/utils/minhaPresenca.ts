import type { PresencaRegistroApi } from './presencaSessao';

function resolveParliamentarianId(registro: PresencaRegistroApi): string | undefined {
    return registro.parliamentarianId ?? registro.parlamentarId ?? undefined;
}

function resolveSituacaoValue(
    situacao: PresencaRegistroApi['situacao'] | string | undefined,
): string | undefined {
    if (!situacao) return undefined;
    if (typeof situacao === 'string') return situacao;
    return situacao.value;
}

export function hasMinhaPresenca(
    registros: PresencaRegistroApi[] | null | undefined,
    parliamentarianId: string | undefined,
): boolean {
    if (!parliamentarianId || !registros?.length) return false;

    const registro = registros.find(
        (item) => resolveParliamentarianId(item) === parliamentarianId,
    );

    if (!registro || !registro.presente) return false;

    const situacao = resolveSituacaoValue(registro.situacao);
    return !situacao || situacao === 'PRESENTE';
}
