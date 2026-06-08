import { NormaEntity } from '../../domain/entities/norma.entity';

export type NormaHttp = {
    id: string;
    numero: string;
    ementa: string;
    data?: Date;
    dataPublicacaoInicio?: Date;
    dataPublicacaoFim?: Date;
    mensagem?: string;
    tipo: {
        id: string;
        nome: string;
    };
    ano?: {
        id: string;
        valor: number;
    };
    esferaFederacao?: {
        id: string;
        nome: string;
    };
    identificador?: {
        id: string;
        nome: string;
    };
    materiaOrigem?: {
        id: string;
        ementa: string;
        numero?: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
};

export class NormaViewModel {
    static toHttp(entity: NormaEntity): NormaHttp {
        const p = entity.toPrimitives();
        return {
            id: p.id,
            numero: p.numero,
            ementa: p.ementa,
            ...(p.data ? { data: p.data } : {}),
            ...(p.dataPublicacaoInicio
                ? { dataPublicacaoInicio: p.dataPublicacaoInicio }
                : {}),
            ...(p.dataPublicacaoFim
                ? { dataPublicacaoFim: p.dataPublicacaoFim }
                : {}),
            ...(p.mensagem ? { mensagem: p.mensagem } : {}),
            tipo: p.tipo,
            ...(p.ano ? { ano: p.ano } : {}),
            ...(p.esferaFederacao
                ? { esferaFederacao: p.esferaFederacao }
                : {}),
            ...(p.identificador ? { identificador: p.identificador } : {}),
            ...(p.materiaOrigem
                ? {
                      materiaOrigem: {
                          id: p.materiaOrigem.id,
                          ementa: p.materiaOrigem.ementa,
                          ...(p.materiaOrigem.numero !== null &&
                          p.materiaOrigem.numero !== undefined
                              ? { numero: p.materiaOrigem.numero }
                              : {}),
                      },
                  }
                : {}),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
