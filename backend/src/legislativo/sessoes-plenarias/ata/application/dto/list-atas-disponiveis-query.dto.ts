import { IsOptional, IsUUID } from 'class-validator';

export class ListAtasDisponiveisQueryDto {
    /** Sessão em edição — a própria ata dela não deve aparecer entre as opções. */
    @IsOptional()
    @IsUUID()
    sessaoId?: string;
}
