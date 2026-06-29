import {
    CategoriaPautaItem,
    FasePauta,
    ResultadoPauta,
    SituacaoPresenca,
    TipoPautaItem,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateIf,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class CreateSessaoPlenariaDto {
    @IsDateString()
    dataInicio: string;

    @IsOptional()
    @IsDateString()
    dataFim?: string;

    @IsString()
    tipoSessaoId: string;

    @IsOptional()
    @IsString()
    sessaoLegislativaId?: string;

    @IsOptional()
    @IsString()
    mensagem?: string;
}

export class FilterSessaoPlenariaDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    tipoSessaoId?: string;

    @IsOptional()
    @IsString()
    situacaoId?: string;

    @IsOptional()
    @IsString()
    sessaoLegislativaId?: string;

    @IsOptional()
    @IsString()
    legislaturaId?: string;

    @IsOptional()
    @IsDateString()
    dataInicioDe?: string;

    @IsOptional()
    @IsDateString()
    dataInicioAte?: string;
}

export class AddPautaItemDto {
    /** Categoria do item; quando ausente assume MATERIA (compatibilidade). */
    @IsOptional()
    @IsEnum(CategoriaPautaItem)
    categoria?: CategoriaPautaItem;

    /** Obrigatório para MATERIA e COMISSAO (matéria objeto do parecer). */
    @ValidateIf((o: AddPautaItemDto) =>
        !o.categoria ||
        o.categoria === CategoriaPautaItem.MATERIA ||
        o.categoria === CategoriaPautaItem.COMISSAO,
    )
    @IsUUID()
    materiaId?: string;

    @ValidateIf((o: AddPautaItemDto) => o.categoria === CategoriaPautaItem.ATO)
    @IsUUID()
    atoId?: string;

    @ValidateIf((o: AddPautaItemDto) => o.categoria === CategoriaPautaItem.NORMA)
    @IsUUID()
    normaId?: string;

    @ValidateIf((o: AddPautaItemDto) => o.categoria === CategoriaPautaItem.COMISSAO)
    @IsUUID()
    comissaoId?: string;

    @ValidateIf((o: AddPautaItemDto) => o.categoria === CategoriaPautaItem.AVISO)
    @IsString()
    avisoTitulo?: string;

    @IsOptional()
    @IsString()
    avisoTexto?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    ordem?: number;

    @IsOptional()
    @IsEnum(FasePauta)
    fase?: FasePauta;

    @IsOptional()
    @IsEnum(TipoPautaItem)
    tipoPautaItem?: TipoPautaItem;
}

export class RegistrarPresencaDto {
    @ValidateIf((o: RegistrarPresencaDto) => !o.parliamentarianId)
    @IsString()
    parlamentarId?: string;

    @ValidateIf((o: RegistrarPresencaDto) => !o.parlamentarId)
    @IsUUID()
    parliamentarianId?: string;

    /** Perfil DDD (Parliamentarian); quando informado com legislatureProfileId, valida mandato ativo. */
    @IsOptional()
    @IsUUID()
    parliamentarianProfileId?: string;

    @IsOptional()
    @IsUUID()
    legislatureProfileId?: string;

    @IsOptional()
    @IsBoolean()
    presente?: boolean;

    @IsOptional()
    @IsEnum(SituacaoPresenca)
    situacao?: SituacaoPresenca;

    @IsOptional()
    @IsString()
    justificativa?: string;
}

export class RegistrarResultadoPautaDto {
    @IsEnum(ResultadoPauta)
    resultado: ResultadoPauta;
}
