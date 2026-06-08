import { AlterarStatusMateriaDto } from '../../application/dto/alterar-status-materia.dto';
import { AdicionarMateriaAutorDto } from '../../application/dto/materia-autor.dto';
import {
    AddCoautorMateriaDto,
    SetAutorExternoDto,
    SetAutorParlamentarDto,
    SetRelatorMateriaDto,
} from '../../application/dto/matter-autoria.dto';
import { ExecutarTramitacaoMateriaDto } from '../../application/dto/matter-tramitation.dto';
import {
    CreateMateriaDto,
    FilterMateriaDto,
} from '../../application/dto/materia.dto';
import { UpdateMateriaDto } from '../../application/dto/update-materia.dto';
import { MatterAuthorshipPayload } from '../../application/view-models/matter-authorship.view-model';

export abstract class MateriaRepository {
    abstract create(tenantId: string, dto: CreateMateriaDto): Promise<unknown>;
    abstract findAll(
        tenantId: string,
        filters: FilterMateriaDto,
    ): Promise<unknown>;
    abstract findOne(tenantId: string, id: string): Promise<unknown>;
    abstract update(
        tenantId: string,
        id: string,
        dto: UpdateMateriaDto,
    ): Promise<unknown>;
    abstract alterarStatus(
        tenantId: string,
        id: string,
        dto: AlterarStatusMateriaDto,
    ): Promise<unknown>;
    abstract tramitarMateria(
        tenantId: string,
        id: string,
        dto: ExecutarTramitacaoMateriaDto,
    ): Promise<unknown>;
    abstract listTramitationActions(
        tenantId: string,
        id: string,
    ): Promise<unknown>;
    abstract remove(tenantId: string, id: string): Promise<unknown>;
    abstract listarAutores(
        tenantId: string,
        materiaId: string,
    ): Promise<unknown>;
    abstract adicionarAutor(
        tenantId: string,
        materiaId: string,
        dto: AdicionarMateriaAutorDto,
    ): Promise<unknown>;
    abstract removerAutor(
        tenantId: string,
        materiaId: string,
        materiaAutorId: string,
    ): Promise<unknown>;
    abstract getAutoria(
        tenantId: string,
        matterId: string,
    ): Promise<MatterAuthorshipPayload>;
    abstract setAutorParlamentar(
        tenantId: string,
        matterId: string,
        dto: SetAutorParlamentarDto,
    ): Promise<MatterAuthorshipPayload>;
    abstract setAutorExterno(
        tenantId: string,
        matterId: string,
        dto: SetAutorExternoDto,
    ): Promise<MatterAuthorshipPayload>;
    abstract addCoautor(
        tenantId: string,
        matterId: string,
        dto: AddCoautorMateriaDto,
    ): Promise<MatterAuthorshipPayload>;
    abstract removeCoautor(
        tenantId: string,
        matterId: string,
        coauthorId: string,
    ): Promise<MatterAuthorshipPayload>;
    abstract setRelator(
        tenantId: string,
        matterId: string,
        dto: SetRelatorMateriaDto,
    ): Promise<MatterAuthorshipPayload>;
}
