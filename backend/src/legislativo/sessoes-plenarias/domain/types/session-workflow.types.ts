import { SessionStatus } from '../enums/session-status.enum';

export type SessionLifecycleEntry = {
    status: SessionStatus;
    observacao?: string;
    em: string;
};

export type SessionWorkflowCapabilities = {
    canStart: boolean;
    canEnd: boolean;
    canCancel: boolean;
    canManageAgenda: boolean;
    canRegisterPresence: boolean;
};
