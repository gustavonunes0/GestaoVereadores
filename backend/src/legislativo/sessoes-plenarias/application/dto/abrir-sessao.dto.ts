import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AbrirSessaoDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    quorumPresente?: number;

    @IsOptional()
    @IsString()
    observacao?: string;
}
