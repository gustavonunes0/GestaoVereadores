import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class AdicionarMateriaAutorDto {
    @IsString()
    autorId: string;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    ordem: number;
}
