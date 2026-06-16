import { IsOptional, IsString } from 'class-validator';

export class CancelarSessaoDto {
    @IsOptional()
    @IsString()
    observacao?: string;
}
