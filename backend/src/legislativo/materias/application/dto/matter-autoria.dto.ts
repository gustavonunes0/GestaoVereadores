import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SetAutorParlamentarDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}

export class SetTenantPartnerDto {
    @ApiProperty({ description: 'TenantPartner cadastrado no tenant' })
    @IsUUID()
    tenantPartnerId!: string;
}

export class AddCoautorMateriaDto {
    @IsOptional()
    @IsUUID()
    parliamentarianId?: string;

    @IsOptional()
    @IsUUID()
    tenantPartnerId?: string;
}

export class SetRelatorMateriaDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}
