import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusMateria } from '@prisma/client';

export class AlterarStatusMateriaDto {
  @IsEnum(StatusMateria)
  status: StatusMateria;

  @IsOptional()
  @IsString()
  observacao?: string;
}
