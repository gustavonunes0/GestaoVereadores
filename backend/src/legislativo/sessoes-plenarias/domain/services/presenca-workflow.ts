import { BadRequestException, ConflictException } from '@nestjs/common';
import { SituacaoPresenca } from '@prisma/client';
import { AttendanceStatus } from '../enums/attendance-status.enum';
import { SessionAttendanceDomainService } from './session-attendance-domain.service';

const attendanceService = new SessionAttendanceDomainService();

function rethrow(error: unknown, useConflict = false): never {
    if (error instanceof Error) {
        if (useConflict) throw new ConflictException(error.message);
        throw new BadRequestException(error.message);
    }
    throw error;
}

export function resolveCamposPresenca(input: {
    situacao?: SituacaoPresenca;
    presente?: boolean;
    justificativa?: string;
}) {
    const fields = attendanceService.resolvePresenceFields({
        situacao: input.situacao as AttendanceStatus | undefined,
        presente: input.presente,
        justificativa: input.justificativa,
    });
    try {
        attendanceService.assertJustificativaWhenRequired(
            fields.situacao,
            fields.justificativa,
        );
    } catch (error) {
        rethrow(error);
    }
    return fields;
}

export function assertPresencaNaoDuplicada(alreadyRegistered: boolean) {
    try {
        attendanceService.assertNoDuplicatePresence(alreadyRegistered);
    } catch (error) {
        rethrow(error, true);
    }
}

export function contaPresencaParaQuorum(
    situacao: SituacaoPresenca,
    presente: boolean,
): boolean {
    return attendanceService.countsForQuorum(
        situacao as AttendanceStatus,
        presente,
    );
}

export function getDefaultSituacaoPresenca() {
    return attendanceService.getDefaultStatus() as SituacaoPresenca;
}

export function resolveCamposPresencaUpdate(
    existing: {
        presente: boolean;
        situacao: SituacaoPresenca;
        justificativa?: string | null;
    },
    input: {
        situacao?: SituacaoPresenca;
        presente?: boolean;
        justificativa?: string;
    },
) {
    const fields = attendanceService.resolvePresenceUpdate(
        {
            presente: existing.presente,
            situacao: existing.situacao as AttendanceStatus,
            justificativa: existing.justificativa,
        },
        {
            situacao: input.situacao as AttendanceStatus | undefined,
            presente: input.presente,
            justificativa: input.justificativa,
        },
    );
    try {
        attendanceService.assertJustificativaWhenRequired(
            fields.situacao,
            fields.justificativa,
        );
    } catch (error) {
        rethrow(error);
    }
    return fields;
}
