import { MatterStatus } from '../../../domain/enums/matter-status.enum';
import { Materia } from '../../../domain/entities/materia.entity';
import { TramitacaoHistorico } from '../../../domain/entities/tramitacao-historico.entity';
import { PublicacaoOficial } from '../../../domain/entities/publicacao-oficial.entity';

type RawTramitacaoHistorico = {
    id: string;
    materiaId: string;
    dataHora: Date;
    statusAnterior: string | null;
    statusNovo: string;
    responsavelId: string | null;
    despacho: string | null;
    observacao: string | null;
    unidadeOrigemId: string | null;
    unidadeDestinoId: string | null;
};

type RawPublicacaoOficial = {
    id: string;
    tenantId: string;
    materiaId: string | null;
    normaId: string | null;
    dataPublicacao: Date;
    veiculo: string;
    paginaInicio: number | null;
    paginaFim: number | null;
    identificador: string | null;
    urlExterna: string | null;
    textoIntegral: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type RawMateria = {
    id: string;
    tenantId: string;
    tipoId: string;
    sigla: string | null;
    numero: number | null;
    anoId: string | null;
    ementa: string;
    justificativa: string | null;
    textoOriginalUrl: string | null;
    textoIntegralUrl: string | null;
    audioUrl: string | null;
    dataProtocolo: Date | null;
    status: string;
    autorId: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tipo?: { id: string; nome: string; sigla: string | null } | null;
    ano?: { id: string; valor: number } | null;
    tramitacaoHistorico?: RawTramitacaoHistorico[];
    publicacoesOficiais?: RawPublicacaoOficial[];
};

export class MateriaMapper {
    static toDomain(raw: RawMateria): Materia {
        const tramitacaoHistorico = (raw.tramitacaoHistorico ?? []).map(
            (h) =>
                new TramitacaoHistorico({
                    id: h.id,
                    materiaId: h.materiaId,
                    dataHora: h.dataHora,
                    statusAnterior: (h.statusAnterior as MatterStatus) ?? null,
                    statusNovo: h.statusNovo as MatterStatus,
                    responsavelId: h.responsavelId,
                    despacho: h.despacho,
                    observacao: h.observacao,
                    unidadeOrigemId: h.unidadeOrigemId,
                    unidadeDestinoId: h.unidadeDestinoId,
                }),
        );

        const publicacoesOficiais = (raw.publicacoesOficiais ?? []).map(
            (p) =>
                new PublicacaoOficial({
                    id: p.id,
                    tenantId: p.tenantId,
                    materiaId: p.materiaId,
                    normaId: p.normaId,
                    dataPublicacao: p.dataPublicacao,
                    veiculo: p.veiculo,
                    paginaInicio: p.paginaInicio,
                    paginaFim: p.paginaFim,
                    identificador: p.identificador,
                    urlExterna: p.urlExterna,
                    textoIntegral: p.textoIntegral,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                }),
        );

        return new Materia({
            id: raw.id,
            tenantId: raw.tenantId,
            tipoId: raw.tipoId,
            sigla: raw.sigla ?? raw.tipo?.sigla ?? '',
            numero: raw.numero,
            anoId: raw.anoId,
            anoValor: raw.ano?.valor ?? null,
            ementa: raw.ementa,
            justificativa: raw.justificativa,
            textoOriginalUrl: raw.textoOriginalUrl,
            textoIntegralUrl: raw.textoIntegralUrl,
            audioUrl: raw.audioUrl,
            dataProtocolo: raw.dataProtocolo,
            status: raw.status as MatterStatus,
            autorId: raw.autorId,
            isRemoved: raw.isRemoved,
            removedAt: raw.removedAt,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            tramitacaoHistorico,
            publicacoesOficiais,
        });
    }
}
