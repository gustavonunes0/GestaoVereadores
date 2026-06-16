import { AtoEntity } from '../../domain/entities/ato.entity';

export type AtoHttp = {
    id: string;
    numero: string;
    dataInicio?: Date;
    dataFim?: Date;
    dataPublicacaoInicio?: Date;
    dataPublicacaoFim?: Date;
    mensagem?: string;
    ementa?: string;
    dataAto?: Date;
    anexoUrl?: string;
    textoUrl?: string;
    identificadorId?: string;
    tipo: {
        id: string;
        nome: string;
    };
    classificacao: {
        id: string;
        nome: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
};

export class AtoViewModel {
    static toHttp(entity: AtoEntity): AtoHttp {
        const p = entity.toPrimitives();
        return {
            id: p.id,
            numero: p.numero,
            ...(p.dataInicio ? { dataInicio: p.dataInicio } : {}),
            ...(p.dataFim ? { dataFim: p.dataFim } : {}),
            ...(p.dataPublicacaoInicio ? { dataPublicacaoInicio: p.dataPublicacaoInicio } : {}),
            ...(p.dataPublicacaoFim ? { dataPublicacaoFim: p.dataPublicacaoFim } : {}),
            ...(p.mensagem ? { mensagem: p.mensagem } : {}),
            ...(p.ementa ? { ementa: p.ementa } : {}),
            ...(p.dataAto ? { dataAto: p.dataAto } : {}),
            ...(p.anexoUrl ? { anexoUrl: p.anexoUrl } : {}),
            ...(p.textoUrl ? { textoUrl: p.textoUrl } : {}),
            ...(p.identificadorId ? { identificadorId: p.identificadorId } : {}),
            tipo: p.tipo,
            classificacao: p.classificacao,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
