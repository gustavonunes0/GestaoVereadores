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
    esferaFederacaoId?: string | null;
    identificadorId?: string | null;
    materiaOrigemId?: string | null;
    mensagem?: string | null;
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

    abstract existsTipoNorma(tipoId: string): Promise<boolean>;
    abstract existsAno(anoId: string): Promise<boolean>;
    abstract existsEsferaFederacao(esferaFederacaoId: string): Promise<boolean>;
    abstract existsIdentificadorNorma(identificadorId: string): Promise<boolean>;
}
