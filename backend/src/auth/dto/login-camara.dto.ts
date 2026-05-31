import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginCamaraDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  /** CNPJ da câmara (com ou sem máscara). */
  @IsOptional()
  @IsString()
  tenantCnpj?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
