import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class ListTenantPartnersQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    nome?: string;
}
