import { IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateAutorDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsString()
  tipoAutorId: string;

  @IsOptional()
  @IsString()
  parlamentarId?: string;
}

export class UpdateAutorDto extends PartialType(CreateAutorDto) {}

export class FilterAutorDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  tipoAutorId?: string;

  @IsOptional()
  @IsString()
  parlamentarId?: string;

  @IsOptional()
  @IsString()
  nome?: string;
}
