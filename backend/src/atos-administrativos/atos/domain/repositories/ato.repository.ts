import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { AtoEntity } from '../entities/ato.entity';

export type CreateAtoRepositoryInput = {
    tenantId: string;
    tipoId: string;
    classificacaoId: string;
    numero: string;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    mensagem?: string | null;
    ementa?: string | null;
    dataAto?: Date | null;
    anexoUrl?: string | null;
    textoUrl?: string | null;
    identificadorId?: string | null;
};

export type UpdateAtoRepositoryInput = {
    tipoId?: string;
    classificacaoId?: string;
    numero?: string;
    dataInicio?: Date | null;
    dataFim?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
    mensagem?: string | null;
    ementa?: string | null;
    dataAto?: Date | null;
    anexoUrl?: string | null;
    textoUrl?: string | null;
    identificadorId?: string | null;
};

export type ListAtosRepositoryQuery = {
    tenantId: string;
    tipoId?: string;
    classificacaoId?: string;
    numero?: string;
    dataPublicacaoDe?: string;
    dataPublicacaoAte?: string;
    dataInicioDe?: string;
    dataInicioAte?: string;
    dataFimDe?: string;
    dataFimAte?: string;
    page?: number;
    limit?: number;
};

export abstract class AtoRepository {
    abstract create(data: CreateAtoRepositoryInput): Promise<AtoEntity>;

    abstract findMany(
        query: ListAtosRepositoryQuery,
    ): Promise<PaginatedResult<AtoEntity>>;

    abstract findById(tenantId: string, id: string): Promise<AtoEntity | null>;

    abstract update(
        tenantId: string,
        id: string,
        data: UpdateAtoRepositoryInput,
    ): Promise<AtoEntity>;

    abstract remove(tenantId: string, id: string): Promise<void>;

    abstract existsByNumero(
        tenantId: string,
        numero: string,
        ignoreAtoId?: string,
    ): Promise<boolean>;

    abstract existsTipoAto(tipoId: string): Promise<boolean>;

    abstract existsClassificacaoAto(classificacaoId: string): Promise<boolean>;
}
