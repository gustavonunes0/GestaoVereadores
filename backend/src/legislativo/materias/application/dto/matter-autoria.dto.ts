import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SetAutorParlamentarDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}

export class SetAutorExternoDto {
    @ApiProperty({ description: 'GuestUser que representa o autor externo' })
    @IsUUID()
    guestUserId!: string;

    @ApiPropertyOptional({
        description: 'Tipo de autor legado (Popular, Executivo). Padrão: Popular',
    })
    @IsOptional()
    @IsUUID()
    tipoAutorId?: string;
}

export class AddCoautorMateriaDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}

export class SetRelatorMateriaDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}
