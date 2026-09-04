import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { TENANT_ROLES_KEY } from '../../../../common/decorators/tenant-roles.decorator';
import { ADMIN_ONLY } from '../../../../auth/guards/guard-combos';
import { UserManagerController } from '../controllers/user-manager.controller';
import { UserManagerModule } from '../../user-manager.module';
import { ConvidarTenantStaffUseCase } from '../use-cases/convidar-tenant-staff.use-case';
import { ListTenantStaffUseCase } from '../use-cases/list-tenant-staff.use-case';
import { UpdateTenantStaffUseCase } from '../use-cases/update-tenant-staff.use-case';
import { StaffUserNameService } from '../../domain/staff-user-name.service';

describe('UserManagerModule (parity with former UsuariosIdentidadeModule)', () => {
    it('exporta o módulo Nest esperado', () => {
        expect(UserManagerModule).toBeDefined();
    });

    it('controller expõe as mesmas operações do antigo módulo usuarios', () => {
        const proto = UserManagerController.prototype;
        expect(typeof proto.list).toBe('function');
        expect(typeof proto.convidar).toBe('function');
        expect(typeof proto.update).toBe('function');
        expect(typeof proto.desativar).toBe('function');
    });

    it('controller está montado em identidade/user-manager', () => {
        const path = Reflect.getMetadata(PATH_METADATA, UserManagerController);
        expect(path).toBe('identidade/user-manager');
    });

    it('rotas HTTP equivalem às do módulo antigo (só mudou o prefixo)', () => {
        expect(Reflect.getMetadata(PATH_METADATA, UserManagerController.prototype.list)).toBe('/');
        expect(
            Reflect.getMetadata(METHOD_METADATA, UserManagerController.prototype.list),
        ).toBe(RequestMethod.GET);

        expect(
            Reflect.getMetadata(PATH_METADATA, UserManagerController.prototype.convidar),
        ).toBe('convidar');
        expect(
            Reflect.getMetadata(METHOD_METADATA, UserManagerController.prototype.convidar),
        ).toBe(RequestMethod.POST);

        expect(
            Reflect.getMetadata(PATH_METADATA, UserManagerController.prototype.update),
        ).toBe(':id');
        expect(
            Reflect.getMetadata(METHOD_METADATA, UserManagerController.prototype.update),
        ).toBe(RequestMethod.PATCH);

        expect(
            Reflect.getMetadata(PATH_METADATA, UserManagerController.prototype.desativar),
        ).toBe(':id/desativar');
        expect(
            Reflect.getMetadata(METHOD_METADATA, UserManagerController.prototype.desativar),
        ).toBe(RequestMethod.PATCH);
    });

    it('operações exigem ADMIN_ONLY (mesmo guard do módulo antigo)', () => {
        for (const method of ['list', 'convidar', 'update', 'desativar'] as const) {
            const roles = Reflect.getMetadata(
                TENANT_ROLES_KEY,
                UserManagerController.prototype[method],
            );
            expect(roles).toEqual([...ADMIN_ONLY]);
        }
    });

    it('providers de caso de uso cobrem listar, convidar e atualizar staff', () => {
        expect(ListTenantStaffUseCase).toBeDefined();
        expect(ConvidarTenantStaffUseCase).toBeDefined();
        expect(UpdateTenantStaffUseCase).toBeDefined();
    });

    it('StaffUserNameService continua disponível para nome do staff', () => {
        const svc = new StaffUserNameService();
        const parts = svc.splitDisplayName('Maria Silva Souza');
        expect(parts.firstName).toBe('Maria');
        expect(parts.lastName).toBe('Silva Souza');
    });
});
