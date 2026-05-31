import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantUserDto } from './create-tenant-user.request';

export class UpdateTenantUserDto extends PartialType(CreateTenantUserDto) {}
