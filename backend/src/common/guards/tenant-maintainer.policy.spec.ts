import 'reflect-metadata';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';
import {
    PARLIAMENTARIAN_SESSION,
    STAFF_AND_ABOVE,
} from '../../auth/guards/guard-combos';
import { NormasController } from '../../controle-juridico/normas/application/controllers/normas.controller';

describe('NormasController maintainer policy', () => {
    it('restringe a criação à equipe da câmara (sem sessão de parlamentar)', () => {
        const roles = Reflect.getMetadata(
            TENANT_ROLES_KEY,
            NormasController.prototype.create,
        ) as string[];
        expect(roles).toEqual(STAFF_AND_ABOVE);
        expect(roles).not.toContain(PARLIAMENTARIAN_SESSION);
    });
});
