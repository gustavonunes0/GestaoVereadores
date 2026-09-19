import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { ParliamentarianStatus } from '../../domain/enums/parliamentarian-status.enum';
import { CondicaoMandato } from '../../mandatos/domain/enums/condicao-mandato.enum';

export class UpdateParliamentarianDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    politicalPartyId?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parliamentaryName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    officeNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    biography?: string;

    @ApiPropertyOptional({ enum: ParliamentarianStatus })
    @IsOptional()
    @IsEnum(ParliamentarianStatus)
    status?: ParliamentarianStatus;

    @ApiPropertyOptional({
        enum: CondicaoMandato,
        description: 'Atualiza a condição do mandato ativo (Titular/Suplente)',
    })
    @IsOptional()
    @IsEnum(CondicaoMandato)
    condicao?: CondicaoMandato;

    @ApiPropertyOptional({
        description: 'Legislatura do mandato ativo',
    })
    @IsOptional()
    @IsUUID()
    legislatureId?: string;

    @ApiPropertyOptional({
        description: 'Titular afastado quando condição = SUPLENTE',
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsUUID()
    titularAfastadoId?: string | null;

    @ApiPropertyOptional({ minLength: 8, description: 'Nova senha de acesso (opcional)' })
    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password?: string;
}
