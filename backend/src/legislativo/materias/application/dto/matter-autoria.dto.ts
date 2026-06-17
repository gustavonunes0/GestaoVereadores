import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SetAutorParlamentarDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}

export class SetAutorExternoDto {
    @ApiProperty({ description: 'Autor externo cadastrado no tenant' })
    @IsUUID()
    autorExternoId!: string;
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
