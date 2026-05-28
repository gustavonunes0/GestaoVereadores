import { RoleUsuario } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';

export const ReadRoles = () =>
  Roles(RoleUsuario.MASTER, RoleUsuario.ADMIN, RoleUsuario.OPERADOR);

export const WriteRoles = () => Roles(RoleUsuario.MASTER, RoleUsuario.ADMIN);

export const MasterOnly = () => Roles(RoleUsuario.MASTER);
