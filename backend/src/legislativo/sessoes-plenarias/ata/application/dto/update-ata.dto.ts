import { IsString, MinLength } from 'class-validator';

export class UpdateAtaDto {
    @IsString()
    @MinLength(1)
    conteudo: string;
}
