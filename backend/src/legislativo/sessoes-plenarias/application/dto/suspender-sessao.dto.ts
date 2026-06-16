import { IsOptional, IsString } from 'class-validator';

export class SuspenderSessaoDto {
    @IsOptional()
    @IsString()
    observacao?: string;
}
