import { NotFoundException } from '@nestjs/common';
import { assertFound } from './assert-found';

describe('assertFound', () => {
    it('retorna a entidade quando existe', () => {
        expect(assertFound({ id: '1' }, 'msg')).toEqual({ id: '1' });
    });

    it('lança NotFoundException quando ausente', () => {
        expect(() => assertFound(null, 'não achou')).toThrow(NotFoundException);
    });
});
