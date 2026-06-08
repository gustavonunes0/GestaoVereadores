import { MandateStatus } from '../enums/mandate-status.enum';
import { ParliamentarianMandateEntity } from '../entities/parliamentarian-mandate.entity';
import { ParliamentarianMandateDomainService } from './parliamentarian-mandate-domain.service';

describe('ParliamentarianMandateDomainService', () => {
    const service = new ParliamentarianMandateDomainService();

    const activeMandate = ParliamentarianMandateEntity.restore({
        id: 'm-1',
        tenantId: 'tenant-1',
        parliamentarianId: 'p-1',
        legislatureId: 'l-1',
        partyAcronym: null,
        partyName: null,
        startedAt: new Date('2024-01-01'),
        endedAt: null,
        status: MandateStatus.ACTIVE,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    it('bloqueia mandato ativo duplicado na mesma legislatura', () => {
        expect(() => service.assertNoActiveDuplicate(activeMandate)).toThrow(
            'Parlamentar já possui mandato ativo nesta legislatura',
        );
    });

    it('permite reativar mandato encerrado', () => {
        const finished = ParliamentarianMandateEntity.restore({
            ...activeMandate.toPrimitives(),
            status: MandateStatus.FINISHED,
            endedAt: new Date('2025-01-01'),
        });
        expect(() => service.assertNoActiveDuplicate(finished)).not.toThrow();
    });

    it('bloqueia encerrar mandato já finalizado', () => {
        const finished = ParliamentarianMandateEntity.restore({
            ...activeMandate.toPrimitives(),
            status: MandateStatus.FINISHED,
            endedAt: new Date('2025-01-01'),
        });
        expect(() => service.assertCanFinish(finished)).toThrow(
            'Mandato já está encerrado',
        );
    });

    it('valida mandato ativo para sessão', () => {
        expect(() => service.assertHasActiveMandate(false)).toThrow(
            'Parlamentar não possui mandato ativo na legislatura informada',
        );
    });
});
