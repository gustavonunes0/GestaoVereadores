import { PublicacaoOficial } from '../../domain/entities/publicacao-oficial.entity';

export class PublicacaoOficialViewModel {
    static toHttp(p: PublicacaoOficial) {
        return {
            id: p.id,
            dataPublicacao: p.dataPublicacao,
            veiculo: p.veiculo,
            paginaInicio: p.paginaInicio,
            paginaFim: p.paginaFim,
            identificador: p.identificador,
            urlExterna: p.urlExterna,
        };
    }
}
