import { IsOptional, IsString } from 'class-validator';

export class PedirPalavraDto {
    @IsOptional()
    @IsString()
    tema?: string;
}
