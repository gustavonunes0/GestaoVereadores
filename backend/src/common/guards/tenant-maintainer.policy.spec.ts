import 'reflect-metadata';
import { TenantMaintainerGuard } from '../guards/tenant-maintainer.guard';
import { NormasController } from '../../controle-juridico/normas/application/controllers/normas.controller';

describe('NormasController maintainer policy', () => {
    it('usa TenantMaintainerGuard nos endpoints de escrita', () => {
        const createGuards = Reflect.getMetadata('__guards__', NormasController.prototype.create);
        const guardNames = (createGuards ?? []).map(
            (guard: { name?: string }) => guard?.name ?? '',
        );
        expect(guardNames).toContain(TenantMaintainerGuard.name);
    });
});
