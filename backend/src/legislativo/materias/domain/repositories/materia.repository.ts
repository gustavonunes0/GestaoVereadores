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
import { MatterStatus } from '../enums/matter-status.enum';

export type TramitarMateriaData = {
    statusAnterior: MatterStatus | null;
    novoStatus: MatterStatus;
    responsavelId?: string;
    despacho?: string;
    observacao?: string;
    unidadeOrigemId?: string;
    unidadeDestinoId?: string;
};

export type AutorExternoListItem = {
    id: string;
    nome: string;
    cargo: string | null;
    instituicao: string | null;
    registro: string | null;
    partido: string | null;
    uf: string | null;
    tipoAutor: { id: string; nome: string; idNegocio: number | null };
};

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
    abstract replaceCoautores(
        tenantId: string,
        matterId: string,
        coautorIds: string[],
    ): Promise<MatterAuthorshipPayload>;

    // ── Métodos novos (clean DDD) ──────────────────────────────────────────

    /** Próximo número sequencial com lock FOR UPDATE para evitar race conditions. */
    abstract proximoNumero(
        tenantId: string,
        tipoId: string,
        anoId: string,
    ): Promise<number>;

    /** Transição de status + registro em TramitacaoHistorico em uma transaction. */
    abstract tramitar(
        id: string,
        tenantId: string,
        dados: TramitarMateriaData,
    ): Promise<void>;

    /** Lista AutorExterno do tenant, opcionalmente filtrado por tipo. */
    abstract listAutoresExternos(
        tenantId: string,
        tipoAutorId?: string,
    ): Promise<AutorExternoListItem[]>;

    /** Adiciona PublicacaoOficial vinculada a uma Materia. */
    abstract addPublicacao(
        tenantId: string,
        materiaId: string,
        data: {
            dataPublicacao: Date;
            veiculo: string;
            paginaInicio?: number;
            paginaFim?: number;
            identificador?: string;
            urlExterna?: string;
            textoIntegral?: string;
        },
    ): Promise<{ id: string; dataPublicacao: Date; veiculo: string }>;
}
