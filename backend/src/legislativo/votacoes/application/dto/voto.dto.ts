import { Voto } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RegistrarVotoDto } from './votacao.dto';

export class UpdateVotoDto {
    @IsEnum(Voto)
    voto: Voto;
}

export class FilterVotoDto {
    @IsOptional()
    @IsUUID()
    parlamentarId?: string;

    @IsOptional()
    @IsEnum(Voto)
    voto?: Voto;
}

export { RegistrarVotoDto };
