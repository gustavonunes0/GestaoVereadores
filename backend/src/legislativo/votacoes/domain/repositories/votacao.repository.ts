import {
    AbrirVotacaoDto,
    FinalizarVotacaoDto,
} from '../../application/dto/votacao.dto';
import {
    FilterVotoDto,
    RegistrarVotoDto,
    UpdateVotoDto,
} from '../../application/dto/voto.dto';
import { VotacaoEntity, ResultadoVotacaoEnum } from '../entities/votacao.entity';
import { TipoQuorum } from '../enums/tipo-quorum.enum';
import { ContagemVotos } from '../services/contagem-votos.service';

export type EncerrarVotacaoDados = {
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    resultado: ResultadoVotacaoEnum;
    responsavelId: string;
    tipoQuorum?: TipoQuorum;
    totalMembros?: number;
    votoQualidade?: boolean;
    presidenteId?: string;
    quorumVotacao?: number;
    motivoEmpate?: string;
    observacoes?: string;
};

export abstract class VotacaoRepository {
    abstract abrirVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: AbrirVotacaoDto,
    ): Promise<unknown>;

    abstract obterVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ): Promise<unknown>;

    abstract listVotos(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        filters: FilterVotoDto,
    ): Promise<unknown>;

    abstract getVotoById(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        votoId: string,
    ): Promise<unknown>;

    abstract registrarVoto(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: RegistrarVotoDto,
    ): Promise<unknown>;

    abstract updateVoto(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        votoId: string,
        dto: UpdateVotoDto,
    ): Promise<unknown>;

    abstract calcularResultadoVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: FinalizarVotacaoDto,
        preview?: boolean,
    ): Promise<unknown>;

    abstract finalizarVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: FinalizarVotacaoDto,
    ): Promise<unknown>;

    // Novos métodos DDD (M5)
    abstract findVotacaoById(id: string): Promise<VotacaoEntity | null>;
    abstract calcularContagem(votacaoId: string): Promise<ContagemVotos>;
    abstract encerrar(
        votacaoId: string,
        pautaItemId: string,
        tenantId: string,
        materiaId: string,
        dados: EncerrarVotacaoDados,
    ): Promise<void>;
}
