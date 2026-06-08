import 'reflect-metadata';
import { RoleUsuario } from '@prisma/client';
import { ROLES_KEY } from '../../../../auth/decorators/roles.decorator';
import { SKIP_TENANT_KEY } from '../../../../common/decorators/skip-tenant.decorator';
import { AtosController } from '../controllers/atos.controller';

describe('AtosController', () => {
    it('usa @SkipTenant()', () => {
        const skipTenant = Reflect.getMetadata(SKIP_TENANT_KEY, AtosController);
        expect(skipTenant).toBe(true);
    });

    it('usa @ReadRoles() em consultas', () => {
        const findAllRoles = Reflect.getMetadata(
            ROLES_KEY,
            AtosController.prototype.findAll,
        );
        expect(findAllRoles).toEqual(
            expect.arrayContaining([
                RoleUsuario.MASTER,
                RoleUsuario.ADMIN,
                RoleUsuario.OPERADOR,
            ]),
        );
    });

    it('usa @WriteRoles() em mutações', () => {
        for (const method of ['create', 'update', 'remove'] as const) {
            const roles = Reflect.getMetadata(
                ROLES_KEY,
                AtosController.prototype[method],
            );
            expect(roles).toEqual(
                expect.arrayContaining([RoleUsuario.MASTER, RoleUsuario.ADMIN]),
            );
        }
    });
});
