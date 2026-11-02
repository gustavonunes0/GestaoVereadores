import { UnprocessableEntityException } from '@nestjs/common';
import {
    assertPhotoFraming,
    defaultPhotoFraming,
    validatePhotoFramingFields,
} from './photo-framing';

describe('photo-framing', () => {
    it('aceita valores válidos com confirmação', () => {
        expect(
            validatePhotoFramingFields(
                {
                    photoPosX: 50,
                    photoPosY: 30,
                    photoZoom: 1.25,
                    photoPositionConfirmed: true,
                },
                { requireConfirmed: true },
            ),
        ).toEqual([]);
    });

    it('rejeita fora de faixa e confirmação ausente', () => {
        expect(
            validatePhotoFramingFields(
                {
                    photoPosX: -1,
                    photoPosY: 101,
                    photoZoom: 0.5, // abaixo de 0.85
                    photoPositionConfirmed: false,
                },
                { requireConfirmed: true },
            ),
        ).toEqual([
            'photoPosX',
            'photoPosY',
            'photoZoom',
            'photoPositionConfirmed',
        ]);
    });

    it('assertPhotoFraming lança 422', () => {
        expect(() =>
            assertPhotoFraming(
                { photoPosX: 50, photoPosY: 30, photoZoom: 1 },
                { requireConfirmed: true },
            ),
        ).toThrow(UnprocessableEntityException);
    });

    it('defaultPhotoFraming retorna padrão de migração', () => {
        expect(defaultPhotoFraming()).toEqual({
            photoPosX: 50,
            photoPosY: 30,
            photoZoom: 1,
            photoPositionConfirmed: false,
        });
    });
});
