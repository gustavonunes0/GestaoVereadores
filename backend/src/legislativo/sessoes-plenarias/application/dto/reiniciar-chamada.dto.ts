import { IsString, MinLength } from 'class-validator';

export class ReiniciarChamadaDto {
    @IsString()
    @MinLength(3)
    justificativa: string;
}
