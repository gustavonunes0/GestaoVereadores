import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import {
    AutorExternoEntity,
    AutorExternoTipoAutor,
    CreateAutorExternoParams,
    UpdateAutorExternoParams,
} from '../entities/autor-externo.entity';

export type AutorExternoWithTipo = {
    entity: AutorExternoEntity;
    tipoAutor: AutorExternoTipoAutor;
};

export type ListAutoresExternosRepositoryQuery = {
    tipoAutorId?: string;
    nome?: string;
    cargo?: string;
    instituicao?: string;
    page?: number;
    limit?: number;
};

export type AutorExternoMateriaListItem = {
    id: string;
    identificacao: string;
    status: string;
};

export abstract class AutorExternoRepository {
    abstract create(
        data: CreateAutorExternoParams,
    ): Promise<AutorExternoWithTipo>;

    abstract findMany(
        tenantId: string,
        query: ListAutoresExternosRepositoryQuery,
    ): Promise<PaginatedResult<AutorExternoWithTipo>>;

    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<AutorExternoWithTipo | null>;

    abstract update(
        tenantId: string,
        id: string,
        data: UpdateAutorExternoParams,
    ): Promise<AutorExternoWithTipo>;

    abstract softDelete(tenantId: string, id: string): Promise<void>;

    abstract listMaterias(
        tenantId: string,
        autorExternoId: string,
    ): Promise<AutorExternoMateriaListItem[]>;

    abstract existsTipoAutor(tipoAutorId: string): Promise<boolean>;
}
