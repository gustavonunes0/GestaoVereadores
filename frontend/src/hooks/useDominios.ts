import { useEffect, useState } from 'react';
import { dominiosApi, type Dominios } from '../api/dominios.api';

export function useDominios() {
    const [dominios, setDominios] = useState<Dominios | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dominiosApi
            .list()
            .then(setDominios)
            .finally(() => setLoading(false));
    }, []);

    return {
        dominios,
        loading,
        anos: dominios?.anos ?? [],
        tiposMateria: dominios?.tiposMateria ?? [],
        tiposNorma: dominios?.tiposNorma ?? [],
        tiposAto: dominios?.tiposAto ?? [],
        classificacoesAto: dominios?.classificacoesAto ?? [],
        tiposSessao: dominios?.tiposSessao ?? [],
        tiposComissao: dominios?.tiposComissao ?? [],
        tiposAutor: dominios?.tiposAutor ?? [],
        esferasFederacao: dominios?.esferasFederacao ?? [],
        identificadoresNorma: dominios?.identificadoresNorma ?? [],
        parlamentares: dominios?.parlamentares ?? [],
        tiposAutorExterno: dominios?.tiposAutorExterno ?? [],
    };
}
