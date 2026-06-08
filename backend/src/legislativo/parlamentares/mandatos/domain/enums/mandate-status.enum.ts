export enum MandateStatus {
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
    INTERRUPTED = 'INTERRUPTED',
    LICENSED = 'LICENSED',
}

export const TERMINAL_MANDATE_STATUSES = new Set<MandateStatus>([
    MandateStatus.FINISHED,
    MandateStatus.INTERRUPTED,
]);
