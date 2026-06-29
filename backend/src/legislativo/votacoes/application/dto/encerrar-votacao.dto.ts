import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

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

    /** Voto de qualidade do presidente — aceito APENAS em empate por MAIORIA_SIMPLES */
    @IsOptional()
    @IsBoolean()
    votoQualidade?: boolean;
}
