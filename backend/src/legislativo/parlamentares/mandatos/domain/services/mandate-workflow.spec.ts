import { BadRequestException } from '@nestjs/common';
import { assertParliamentarianHasActiveMandate } from './mandate-workflow';

describe('mandate-workflow', () => {
    it('aceita parlamentar com mandato ativo', () => {
        expect(() => assertParliamentarianHasActiveMandate(true)).not.toThrow();
    });

    it('rejeita parlamentar sem mandato ativo', () => {
        expect(() => assertParliamentarianHasActiveMandate(false)).toThrow(
            BadRequestException,
        );
    });
});
