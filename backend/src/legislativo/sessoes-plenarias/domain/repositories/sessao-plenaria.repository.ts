import {
    AddPautaItemDto,
    CreateSessaoPlenariaDto,
    FilterSessaoPlenariaDto,
    RegistrarPresencaDto,
    RegistrarResultadoPautaDto,
} from '../../application/dto/sessao.dto';
import {
    FilterPresencaDto,
    UpdatePresencaDto,
} from '../../application/dto/presenca.dto';
import { FilterPautaDto, UpdatePautaItemDto } from '../../application/dto/pauta.dto';
import { UpdateSessaoPlenariaDto } from '../../application/dto/update-sessao.dto';
import { ExecutarCicloVidaSessaoDto } from '../../application/dto/session-lifecycle.dto';
import { SessaoPlenariaEntity } from '../entities/sessao-plenaria.entity';
import { StatusSessao } from '../enums/status-sessao.enum';
import { FaseSessao } from '../enums/fase-sessao.enum';

export type TransicionarStatusDados = {
    novoStatus: StatusSessao;
    responsavelId?: string;
    observacao?: string;
    quorumPresente?: number;
};

export type QuorumInfo = {
    quorumMinimo: number;
    quorumPresente: number;
    temQuorum: boolean;
};

export abstract class SessaoPlenariaRepository {
    abstract create(
        tenantId: string,
        dto: CreateSessaoPlenariaDto,
    ): Promise<unknown>;
    abstract findAll(
        tenantId: string,
        filters: FilterSessaoPlenariaDto,
    ): Promise<unknown>;
    abstract findOne(tenantId: string, id: string): Promise<unknown>;
    abstract update(
        tenantId: string,
        id: string,
        dto: UpdateSessaoPlenariaDto,
    ): Promise<unknown>;
    abstract executarCicloVida(
        tenantId: string,
        id: string,
        dto: ExecutarCicloVidaSessaoDto,
    ): Promise<unknown>;
    abstract listLifecycleActions(
        tenantId: string,
        id: string,
    ): Promise<unknown>;
    abstract remove(tenantId: string, id: string): Promise<unknown>;
    abstract addPautaItem(
        tenantId: string,
        sessaoId: string,
        dto: AddPautaItemDto,
    ): Promise<unknown>;
    abstract listPautaItens(
        tenantId: string,
        sessaoId: string,
        filters: FilterPautaDto,
    ): Promise<unknown>;
    abstract getPautaItemById(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ): Promise<unknown>;
    abstract updatePautaItem(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: UpdatePautaItemDto,
    ): Promise<unknown>;
    abstract removerPautaItem(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ): Promise<unknown>;
    abstract registrarResultadoPauta(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: RegistrarResultadoPautaDto,
    ): Promise<unknown>;
    abstract listPresencas(
        tenantId: string,
        sessaoId: string,
        filters: FilterPresencaDto,
    ): Promise<unknown>;
    abstract getPresencaById(
        tenantId: string,
        sessaoId: string,
        presencaId: string,
    ): Promise<unknown>;
    abstract registrarPresenca(
        tenantId: string,
        sessaoId: string,
        dto: RegistrarPresencaDto,
    ): Promise<unknown>;
    abstract updatePresenca(
        tenantId: string,
        sessaoId: string,
        presencaId: string,
        dto: UpdatePresencaDto,
    ): Promise<unknown>;

    // Novos métodos DDD (M4) — usados pelos novos use cases
    abstract findSessaoById(id: string, tenantId: string): Promise<SessaoPlenariaEntity | null>;
    abstract transicionarStatus(
        id: string,
        tenantId: string,
        dados: TransicionarStatusDados,
    ): Promise<void>;
    abstract calcularQuorum(sessaoId: string, tenantId: string): Promise<QuorumInfo>;
    abstract publicarPauta(sessaoId: string, tenantId: string): Promise<void>;
    // M11 — fase da sessão
    abstract setFase(id: string, tenantId: string, fase: FaseSessao): Promise<void>;
    // M13 — sessão ativa para parlamentar
    abstract findAtiva(tenantId: string): Promise<SessaoPlenariaEntity | null>;

    abstract resolveDefaultSessaoLegislativaId(
        tenantId: string,
    ): Promise<string | null>;

    abstract getLegislaturaContexto(tenantId: string): Promise<{
        legislaturas: Array<{
            id: string;
            numero: number;
            sessoesLegislativas: Array<{ id: string; numero: number }>;
        }>;
        vigente: {
            legislaturaId: string;
            legislaturaNumero: number;
            sessaoLegislativaId: string | null;
            sessaoLegislativaNumero: number | null;
        } | null;
    }>;
}
