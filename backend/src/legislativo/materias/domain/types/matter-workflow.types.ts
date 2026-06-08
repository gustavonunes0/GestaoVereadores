import { MatterStatus } from '../enums/matter-status.enum';

export type MatterTramitationEntry = {
    status: MatterStatus;
    observacao?: string;
    em: string;
};

export type MatterWorkflowCapabilities = {
    canTramitate: boolean;
    canEnterAgenda: boolean;
    canBeVoted: boolean;
    canGenerateNorm: boolean;
};

export type MatterStatusTransition = {
    from: MatterStatus;
    to: MatterStatus[];
};
