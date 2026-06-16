import { StatusNorma } from '../../domain/enums/status-norma.enum';
import { NormaEntity } from '../../domain/entities/norma.entity';

export type NormaHttp = {
    id: string;
    numero: string;
    ementa: string;
    status: StatusNorma;
    data?: Date;
    dataPublicacaoInicio?: Date;
    dataPublicacaoFim?: Date;
    mensagem?: string;
    complementar: boolean;
    // ciclo jurídico
    dataSancao?: Date;
    dataVeto?: Date;
    tipoVeto?: string;
    motivoVeto?: string;
    dataPromulgacao?: Date;
    dataPublicacao?: Date;
    dataVigencia?: Date;
    dataRevogacao?: Date;
    normaRevoganteId?: string;
    textoUrl?: string;
    textoIntegralUrl?: string;
    audioUrl?: string;
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
            status: entity.statusDerived,
            complementar: p.complementar,
            ...(p.data ? { data: p.data } : {}),
            ...(p.dataPublicacaoInicio ? { dataPublicacaoInicio: p.dataPublicacaoInicio } : {}),
            ...(p.dataPublicacaoFim ? { dataPublicacaoFim: p.dataPublicacaoFim } : {}),
            ...(p.mensagem ? { mensagem: p.mensagem } : {}),
            ...(p.dataSancao ? { dataSancao: p.dataSancao } : {}),
            ...(p.dataVeto ? { dataVeto: p.dataVeto } : {}),
            ...(p.tipoVeto ? { tipoVeto: p.tipoVeto } : {}),
            ...(p.motivoVeto ? { motivoVeto: p.motivoVeto } : {}),
            ...(p.dataPromulgacao ? { dataPromulgacao: p.dataPromulgacao } : {}),
            ...(p.dataPublicacao ? { dataPublicacao: p.dataPublicacao } : {}),
            ...(p.dataVigencia ? { dataVigencia: p.dataVigencia } : {}),
            ...(p.dataRevogacao ? { dataRevogacao: p.dataRevogacao } : {}),
            ...(p.normaRevoganteId ? { normaRevoganteId: p.normaRevoganteId } : {}),
            ...(p.textoUrl ? { textoUrl: p.textoUrl } : {}),
            ...(p.textoIntegralUrl ? { textoIntegralUrl: p.textoIntegralUrl } : {}),
            ...(p.audioUrl ? { audioUrl: p.audioUrl } : {}),
            tipo: p.tipo,
            ...(p.ano ? { ano: p.ano } : {}),
            ...(p.esferaFederacao ? { esferaFederacao: p.esferaFederacao } : {}),
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
