import { AttendanceStatus } from '../enums/attendance-status.enum';

export type PresenceFields = {
    presente: boolean;
    situacao: AttendanceStatus;
    justificativa?: string | null;
};

/**
 * Regras de presença em sessão plenária (task 24).
 */
export class SessionAttendanceDomainService {
    getDefaultStatus(): AttendanceStatus {
        return AttendanceStatus.PRESENTE;
    }

    resolvePresenceFields(input: {
        situacao?: AttendanceStatus;
        presente?: boolean;
        justificativa?: string;
    }): PresenceFields {
        if (input.situacao) {
            const presente = input.situacao === AttendanceStatus.PRESENTE;
            return {
                presente,
                situacao: input.situacao,
                justificativa: input.justificativa?.trim() || null,
            };
        }

        const presente = input.presente ?? true;
        return {
            presente,
            situacao: presente
                ? AttendanceStatus.PRESENTE
                : AttendanceStatus.AUSENTE,
            justificativa: input.justificativa?.trim() || null,
        };
    }

    assertJustificativaWhenRequired(
        situacao: AttendanceStatus,
        justificativa?: string | null,
    ) {
        if (situacao === AttendanceStatus.JUSTIFICADO && !justificativa?.trim()) {
            throw new Error(
                'Justificativa é obrigatória para presença JUSTIFICADA',
            );
        }
    }

    assertNoDuplicatePresence(alreadyRegistered: boolean) {
        if (alreadyRegistered) {
            throw new Error(
                'Parlamentar já possui registro de presença nesta sessão',
            );
        }
    }

    countsForQuorum(situacao: AttendanceStatus, presente: boolean): boolean {
        return presente || situacao === AttendanceStatus.PRESENTE;
    }

    resolvePresenceUpdate(
        existing: PresenceFields,
        input: {
            situacao?: AttendanceStatus;
            presente?: boolean;
            justificativa?: string;
        },
    ): PresenceFields {
        if (input.situacao) {
            return this.resolvePresenceFields({
                situacao: input.situacao,
                justificativa:
                    input.justificativa ??
                    existing.justificativa ??
                    undefined,
            });
        }

        if (input.presente !== undefined) {
            return this.resolvePresenceFields({
                presente: input.presente,
                justificativa:
                    input.justificativa ??
                    existing.justificativa ??
                    undefined,
            });
        }

        const justificativa =
            input.justificativa !== undefined
                ? input.justificativa
                : existing.justificativa;
        this.assertJustificativaWhenRequired(existing.situacao, justificativa);
        return {
            presente: existing.presente,
            situacao: existing.situacao,
            justificativa: justificativa?.trim() || null,
        };
    }
}
