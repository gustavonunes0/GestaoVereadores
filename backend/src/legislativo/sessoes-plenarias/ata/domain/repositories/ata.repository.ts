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

export abstract class AtaRepository {
    abstract findBySessaoId(sessaoPlenariaId: string, tenantId: string): Promise<AtaEntity | null>;
    abstract findById(id: string, tenantId: string): Promise<AtaEntity | null>;
    abstract create(dados: CreateAtaData): Promise<AtaEntity>;
    abstract update(id: string, dados: UpdateAtaData): Promise<AtaEntity>;
}
