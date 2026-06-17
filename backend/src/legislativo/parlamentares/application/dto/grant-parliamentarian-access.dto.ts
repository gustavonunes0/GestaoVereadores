import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class GrantParliamentarianAccessDto {
    @ApiPropertyOptional()
    @ValidateIf((dto: GrantParliamentarianAccessDto) => !dto.cpf)
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ example: '123.456.789-09' })
    @ValidateIf((dto: GrantParliamentarianAccessDto) => !dto.userId)
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, {
        message: 'CPF inválido',
    })
    cpf?: string;

    @ApiPropertyOptional({ minLength: 8 })
    @ValidateIf((dto: GrantParliamentarianAccessDto) => !!dto.cpf)
    @IsString()
    @MinLength(8, { message: 'Senha deve ter ao menos 8 caracteres' })
    password?: string;

    @ApiPropertyOptional()
    @ValidateIf((dto: GrantParliamentarianAccessDto) => !!dto.cpf && !dto.parliamentaryName)
    @IsString()
    @IsNotEmpty()
    parliamentaryName?: string;
}
