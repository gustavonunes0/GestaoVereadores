import { MandateStatus } from '../enums/mandate-status.enum';
import { ParliamentarianMandateEntity } from '../entities/parliamentarian-mandate.entity';

export class ParliamentarianMandateDomainService {
    assertNoActiveDuplicate(existing: ParliamentarianMandateEntity | null) {
        if (existing?.isActive) {
            throw new Error(
                'Parlamentar já possui mandato ativo nesta legislatura',
            );
        }
    }

    assertCanFinish(mandate: ParliamentarianMandateEntity) {
        if (mandate.status === MandateStatus.FINISHED) {
            throw new Error('Mandato já está encerrado');
        }
        if (mandate.status === MandateStatus.INTERRUPTED) {
            throw new Error('Mandato já está interrompido');
        }
    }

    assertHasActiveMandate(hasActiveMandate: boolean) {
        if (!hasActiveMandate) {
            throw new Error(
                'Parlamentar não possui mandato ativo na legislatura informada',
            );
        }
    }
}
