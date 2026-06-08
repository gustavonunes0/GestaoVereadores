import { BadRequestException } from '@nestjs/common';

export function assertParliamentarianHasActiveMandate(hasActiveMandate: boolean) {
    if (!hasActiveMandate) {
        throw new BadRequestException(
            'Parlamentar não possui mandato ativo na legislatura da sessão',
        );
    }
}
