import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class SetPautaItemAtualDto {
    /** `null` limpa a seleção (tela de espera no painel). */
    @ValidateIf((_, v) => v !== null && v !== undefined)
    @IsUUID()
    @IsOptional()
    pautaItemId?: string | null;
}
