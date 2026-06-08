import { SessionAttendanceDomainService } from './session-attendance-domain.service';
import { AttendanceStatus } from '../enums/attendance-status.enum';

describe('SessionAttendanceDomainService', () => {
    const service = new SessionAttendanceDomainService();

    it('usa PRESENTE como situação padrão', () => {
        expect(service.getDefaultStatus()).toBe(AttendanceStatus.PRESENTE);
    });

    it('resolve campos a partir de situacao', () => {
        expect(
            service.resolvePresenceFields({
                situacao: AttendanceStatus.JUSTIFICADO,
                justificativa: ' viagem oficial ',
            }),
        ).toEqual({
            presente: false,
            situacao: AttendanceStatus.JUSTIFICADO,
            justificativa: 'viagem oficial',
        });
    });

    it('resolve campos a partir de presente legado', () => {
        expect(
            service.resolvePresenceFields({ presente: false }),
        ).toEqual({
            presente: false,
            situacao: AttendanceStatus.AUSENTE,
            justificativa: null,
        });
    });

    it('exige justificativa para JUSTIFICADO', () => {
        expect(() =>
            service.assertJustificativaWhenRequired(
                AttendanceStatus.JUSTIFICADO,
                '',
            ),
        ).toThrow('Justificativa é obrigatória');
    });

    it('impede presença duplicada', () => {
        expect(() => service.assertNoDuplicatePresence(true)).toThrow(
            'Parlamentar já possui registro de presença',
        );
    });

    it('conta apenas PRESENTE para quorum', () => {
        expect(
            service.countsForQuorum(AttendanceStatus.PRESENTE, true),
        ).toBe(true);
        expect(
            service.countsForQuorum(AttendanceStatus.JUSTIFICADO, false),
        ).toBe(false);
    });

    it('atualiza apenas justificativa mantendo situacao', () => {
        expect(
            service.resolvePresenceUpdate(
                {
                    presente: false,
                    situacao: AttendanceStatus.JUSTIFICADO,
                    justificativa: 'antiga',
                },
                { justificativa: 'nova justificativa' },
            ),
        ).toEqual({
            presente: false,
            situacao: AttendanceStatus.JUSTIFICADO,
            justificativa: 'nova justificativa',
        });
    });
});
