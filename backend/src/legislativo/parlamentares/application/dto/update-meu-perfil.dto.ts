import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateMeuPerfilDto {
    @IsOptional() @IsString() @MinLength(3) @MaxLength(100)
    parliamentaryName?: string;

    @IsOptional() @IsUrl()
    photoUrl?: string;

    @IsOptional() @IsEmail()
    email?: string;

    @IsOptional() @IsString() @MaxLength(20)
    telefone?: string;

    @IsOptional() @IsString() @MaxLength(100)
    gabinete?: string;
}
