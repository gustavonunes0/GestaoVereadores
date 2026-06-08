/** Alinhado ao enum Prisma `SituacaoPresenca`. */
export enum AttendanceStatus {
    PRESENTE = 'PRESENTE',
    AUSENTE = 'AUSENTE',
    JUSTIFICADO = 'JUSTIFICADO',
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENTE]: 'Presente',
    [AttendanceStatus.AUSENTE]: 'Ausente',
    [AttendanceStatus.JUSTIFICADO]: 'Justificado',
};
