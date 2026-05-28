import { IsDateString, IsOptional, IsString } from 'class-validator';

/** Filtros equivalentes a RELATORIOS_ATIVIDADELEGISLATIVACOMPLETO */
export class RelatorioAtividadeCompletoDto {
  @IsString()
  legislaturaId: string;

  @IsString()
  sessaoLegislativaId: string;

  @IsOptional()
  @IsDateString()
  dataInicioDe?: string;

  @IsOptional()
  @IsDateString()
  dataInicioAte?: string;
}

/** Filtros equivalentes a RELATORIOS_ATIVIDADELEGISLATIVAGERAL */
export class RelatorioAtividadeGeralDto {
  @IsString()
  legislaturaId: string;

  @IsOptional()
  @IsDateString()
  dataApresentacaoDe?: string;

  @IsOptional()
  @IsDateString()
  dataApresentacaoAte?: string;

  @IsOptional()
  @IsString()
  tipoAutorId?: string;

  @IsOptional()
  @IsString()
  autorId?: string;
}

/** Filtros equivalentes a RELATORIOS_PRESENCAANALITICA / PRESENCAGERAL */
export class RelatorioPresencaDto {
  @IsString()
  legislaturaId: string;

  @IsString()
  sessaoLegislativaId: string;

  @IsOptional()
  @IsString()
  tipoSessaoId?: string;

  @IsOptional()
  @IsString()
  sessaoPlenariaId?: string;

  @IsOptional()
  @IsDateString()
  dataInicioDe?: string;

  @IsOptional()
  @IsDateString()
  dataInicioAte?: string;
}
