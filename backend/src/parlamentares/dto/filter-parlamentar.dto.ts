import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class FilterParlamentarDto extends PaginationQueryDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === '1' || value === true)
  ativo?: boolean;
}
