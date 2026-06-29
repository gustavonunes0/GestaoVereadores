import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AbrirSessaoDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    quorumPresente?: number;

    @IsOptional()
    @IsString()
    observacao?: string;

    /** Dispensa quórum mínimo na abertura e nas votações (ambiente de teste). */
    @IsOptional()
    @IsBoolean()
    modoTeste?: boolean;
}
