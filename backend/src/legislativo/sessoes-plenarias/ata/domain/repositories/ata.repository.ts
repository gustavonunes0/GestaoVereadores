import { AtaEntity } from '../entities/ata.entity';

export type CreateAtaData = {
    tenantId: string;
    sessaoPlenariaId: string;
    conteudo: string;
    geradaAutomaticamente: boolean;
};

export type UpdateAtaData = {
    conteudo?: string;
    status?: AtaEntity['status'];
    aprovadaEm?: Date;
    aprovadaPorId?: string;
    pdfUrl?: string;
};

/**
 * Projeção leve para escolher uma ata numa lista — carrega a identificação da
 * sessão de origem, mas não o `conteudo`, que é um texto longo.
 */
export type AtaResumo = {
    id: string;
    status: AtaEntity['status'];
    sessaoPlenariaId: string;
    sessaoDataInicio: Date;
    sessaoTipoNome: string | null;
};

export abstract class AtaRepository {
    abstract findBySessaoId(sessaoPlenariaId: string, tenantId: string): Promise<AtaEntity | null>;
    abstract findById(id: string, tenantId: string): Promise<AtaEntity | null>;
    abstract create(dados: CreateAtaData): Promise<AtaEntity>;
    abstract update(id: string, dados: UpdateAtaData): Promise<AtaEntity>;
    abstract listResumos(
        tenantId: string,
        opcoes?: { excluirSessaoId?: string; limite?: number },
    ): Promise<AtaResumo[]>;
}
