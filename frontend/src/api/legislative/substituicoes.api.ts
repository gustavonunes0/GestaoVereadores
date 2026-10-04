import { api } from '../client';
import { API_PATHS } from '../paths';
import type {
    CreateSubstituicaoDto,
    ElencoExercicioSessao,
    Substituicao,
    SubstituicaoHistorico,
    SuplenteElegivel,
    UpdateSubstituicaoDto,
} from '../../types/substituicoes';

export const substituicoesApi = {
    listByParlamentar: (parliamentarianId: string) =>
        api<Substituicao[]>(
            `${API_PATHS.substituicoes}?parliamentarianId=${encodeURIComponent(parliamentarianId)}`,
        ),

    suplentesElegiveis: (titularId: string) =>
        api<SuplenteElegivel[]>(
            `${API_PATHS.substituicoes}/suplentes-elegiveis?titularId=${encodeURIComponent(titularId)}`,
        ),

    historico: (id: string) =>
        api<SubstituicaoHistorico[]>(`${API_PATHS.substituicaoById(id)}/historico`),

    create: (dto: CreateSubstituicaoDto) =>
        api<Substituicao>(API_PATHS.substituicoes, {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    update: (id: string, dto: UpdateSubstituicaoDto) =>
        api<Substituicao>(API_PATHS.substituicaoById(id), {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    encerrar: (id: string) =>
        api<Substituicao>(`${API_PATHS.substituicaoById(id)}/encerrar`, { method: 'POST' }),

    elencoDaSessao: (sessaoId: string) =>
        api<ElencoExercicioSessao>(API_PATHS.sessoesElencoExercicio(sessaoId)),
};
