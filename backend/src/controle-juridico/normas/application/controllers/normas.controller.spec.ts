import 'reflect-metadata';
import { SKIP_TENANT_KEY } from '../../../../common/decorators/skip-tenant.decorator';
import { NormasController } from '../controllers/normas.controller';

describe('NormasController', () => {
    it('não usa @SkipTenant()', () => {
        const skipTenant = Reflect.getMetadata(SKIP_TENANT_KEY, NormasController);
        expect(skipTenant).toBeUndefined();
    });

    it('não depende de NormasService legado', () => {
        const paramTypes = Reflect.getMetadata(
            'design:paramtypes',
            NormasController,
        );
        const names = (paramTypes ?? []).map(
            (type: { name?: string }) => type?.name ?? '',
        );
        expect(names.some((name: string) => name === 'NormasService')).toBe(
            false,
        );
    });
});
