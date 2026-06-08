import { randomUUID } from 'crypto';
import { SessionStatus } from '../enums/session-status.enum';

type PlenarySessionProps = {
    id: string;
    tenantId: string;
    tipoSessaoId: string;
    situacaoId: string;
    dataInicio: Date;
    dataFim: Date | null;
    sessaoLegislativaId: string | null;
    mensagem: string | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type CreatePlenarySessionParams = {
    tenantId: string;
    tipoSessaoId: string;
    situacaoId: string;
    dataInicio: Date;
    dataFim?: Date | null;
    sessaoLegislativaId?: string | null;
    mensagem?: string | null;
};

/**
 * Sessão plenária da Câmara — possui ciclo de vida com situação controlada.
 */
export class PlenarySessionEntity {
    private constructor(private props: PlenarySessionProps) {}

    static create(params: CreatePlenarySessionParams) {
        const now = new Date();
        return new PlenarySessionEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            tipoSessaoId: params.tipoSessaoId,
            situacaoId: params.situacaoId,
            dataInicio: params.dataInicio,
            dataFim: params.dataFim ?? null,
            sessaoLegislativaId: params.sessaoLegislativaId ?? null,
            mensagem: params.mensagem ?? null,
            isRemoved: false,
            createdAt: now,
            updatedAt: now,
        });
    }

    get dataInicio() {
        return this.props.dataInicio;
    }

    get dataFim() {
        return this.props.dataFim;
    }
}
