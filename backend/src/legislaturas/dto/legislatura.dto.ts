import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateLegislaturaDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numero: number;

  @IsDateString()
  dataInicio: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class CreateSessaoLegislativaDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numero: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
