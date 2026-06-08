import {
    AbrirVotacaoDto,
    FinalizarVotacaoDto,
} from '../../application/dto/votacao.dto';
import {
    FilterVotoDto,
    RegistrarVotoDto,
    UpdateVotoDto,
} from '../../application/dto/voto.dto';

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
}
