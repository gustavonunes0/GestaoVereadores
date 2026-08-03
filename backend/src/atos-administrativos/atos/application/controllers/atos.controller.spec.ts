import 'reflect-metadata';
import { TENANT_ROLES_KEY } from '../../../../common/decorators/tenant-roles.decorator';
import { ADMIN_ONLY, STAFF_AND_ABOVE } from '../../../../auth/guards/guard-combos';
import { AtosController } from './atos.controller';

describe('AtosController', () => {
    it('não usa @SkipTenant() — todos os endpoints requerem isolamento de tenant', () => {
        const SKIP_TENANT_KEY = 'skipTenant';
        const skipTenant = Reflect.getMetadata(SKIP_TENANT_KEY, AtosController);
        expect(skipTenant).toBeUndefined();
    });

    it('usa @TenantRoles(STAFF_AND_ABOVE) em create', () => {
        const roles = Reflect.getMetadata(
            TENANT_ROLES_KEY,
            AtosController.prototype.create,
        );
        expect(roles).toEqual(expect.arrayContaining([...STAFF_AND_ABOVE]));
    });

    it('usa @TenantRoles(ADMIN_ONLY) em mutações admin', () => {
        for (const method of ['update', 'remove'] as const) {
            const roles = Reflect.getMetadata(
                TENANT_ROLES_KEY,
                AtosController.prototype[method],
            );
            expect(roles).toEqual(expect.arrayContaining([...ADMIN_ONLY]));
        }
    });
});
