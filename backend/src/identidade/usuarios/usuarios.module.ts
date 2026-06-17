import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { UsuariosIdentidadeController } from './application/controllers/usuarios.controller';
import { ConvidarTenantStaffUseCase } from './application/use-cases/convidar-tenant-staff.use-case';
import { ListTenantStaffUseCase } from './application/use-cases/list-tenant-staff.use-case';
import { UpdateTenantStaffUseCase } from './application/use-cases/update-tenant-staff.use-case';

@Module({
    imports: [PrismaModule, UsersModule],
    controllers: [UsuariosIdentidadeController],
    providers: [
        ListTenantStaffUseCase,
        ConvidarTenantStaffUseCase,
        UpdateTenantStaffUseCase,
    ],
})
export class UsuariosIdentidadeModule {}
