import { api } from './client';
import { API_PATHS } from './paths';

export type LookupOption = { id: string; nome: string; codigo?: string };
export type AnoOption = { id: string; valor: number };

export type Dominios = {
    anos: AnoOption[];
    tiposMateria: LookupOption[];
    tiposComissao: LookupOption[];
    tiposListagem: LookupOption[];
    tematicas: LookupOption[];
    origensMateria: LookupOption[];
    locaisOrigemExterna: LookupOption[];
    tiposNorma: LookupOption[];
    esferasFederacao: LookupOption[];
    identificadoresNorma: LookupOption[];
    tiposSessao: LookupOption[];
    situacoesSessao: LookupOption[];
    tiposAutor: LookupOption[];
    tiposAutorExterno: LookupOption[];
    statusTramitacao: LookupOption[];
    unidadesTramitacao: LookupOption[];
    cargosMesa: LookupOption[];
    tiposAto: LookupOption[];
    classificacoesAto: LookupOption[];
    parlamentares: LookupOption[];
};

export const dominiosApi = {
    list: () => api<Dominios>(API_PATHS.dominios),
};
