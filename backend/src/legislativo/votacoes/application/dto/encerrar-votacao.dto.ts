import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EncerrarVotacaoDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    quorumVotacao?: number;

    @IsOptional()
    @IsString()
    motivoEmpate?: string;

    @IsOptional()
    @IsString()
    observacoes?: string;
}
