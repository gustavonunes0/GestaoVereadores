import { IsOptional, IsString } from 'class-validator';

export class EncerrarSessaoDto {
    @IsOptional()
    @IsString()
    observacao?: string;
}
