import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { NormaEntity } from '../entities/norma.entity';

export type CreateNormaRepositoryInput = {
    tipoId: string;
    numero: string;
    ementa: string;
    anoId?: string | null;
    data?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    dataPublicacao?: Date | null;
    esferaFederacaoId?: string | null;
    identificadorId?: string | null;
    materiaOrigemId?: string | null;
    mensagem?: string | null;
    complementar?: boolean;
    veiculoPublicacao?: string | null;
    urlExternaPublicacao?: string | null;
    paginaInicio?: number | null;
    paginaFim?: number | null;
    textoIntegralUrl?: string | null;
    audioUrl?: string | null;
    textoUrl?: string | null;
};

export type UpdateNormaRepositoryInput = {
    tipoId?: string;
    numero?: string;
    ementa?: string;
    anoId?: string | null;
    data?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    esferaFederacaoId?: string | null;
    identificadorId?: string | null;
    materiaOrigemId?: string | null;
    mensagem?: string | null;
    complementar?: boolean;
    textoIntegralUrl?: string | null;
    audioUrl?: string | null;
    textoUrl?: string | null;
};

export type RegistrarSancaoInput = {
    dataSancao: Date;
    textoUrl?: string | null;
};

export type RegistrarVetoInput = {
    dataVeto: Date;
    tipoVeto?: string | null;
    motivoVeto?: string | null;
};

export type RegistrarPromulgacaoInput = {
    dataPromulgacao: Date;
};

export type RegistrarPublicacaoInput = {
    dataPublicacao: Date;
    dataVigencia?: Date | null;
};

export type RevogarNormaInput = {
    dataRevogacao: Date;
    normaRevoganteId?: string | null;
};

export type ListNormasRepositoryQuery = {
    search?: string;
    tipoId?: string;
    anoId?: string;
    esferaFederacaoId?: string;
    identificadorId?: string;
    materiaOrigemId?: string;
    numero?: string;
    dataInicio?: string;
    dataFim?: string;
    page?: number;
    limit?: number;
};

export abstract class NormaRepository {
    abstract create(
        tenantId: string,
        data: CreateNormaRepositoryInput,
    ): Promise<NormaEntity>;

    abstract findMany(
        tenantId: string,
        query: ListNormasRepositoryQuery,
    ): Promise<PaginatedResult<NormaEntity>>;

    abstract findPublic(
        query: ListNormasRepositoryQuery,
    ): Promise<PaginatedResult<NormaEntity>>;

    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<NormaEntity | null>;

    abstract update(
        tenantId: string,
        id: string,
        data: UpdateNormaRepositoryInput,
    ): Promise<NormaEntity>;

    abstract softDelete(tenantId: string, id: string): Promise<void>;

    abstract registrarSancao(tenantId: string, id: string, data: RegistrarSancaoInput): Promise<NormaEntity>;
    abstract registrarVeto(tenantId: string, id: string, data: RegistrarVetoInput): Promise<NormaEntity>;
    abstract registrarPromulgacao(tenantId: string, id: string, data: RegistrarPromulgacaoInput): Promise<NormaEntity>;
    abstract registrarPublicacao(tenantId: string, id: string, data: RegistrarPublicacaoInput): Promise<NormaEntity>;
    abstract revogar(tenantId: string, id: string, data: RevogarNormaInput): Promise<NormaEntity>;

    abstract existsTipoNorma(tipoId: string): Promise<boolean>;
    abstract existsAno(anoId: string): Promise<boolean>;
    abstract existsEsferaFederacao(esferaFederacaoId: string): Promise<boolean>;
    abstract existsIdentificadorNorma(identificadorId: string): Promise<boolean>;
}
