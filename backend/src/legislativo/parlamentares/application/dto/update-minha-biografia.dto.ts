import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMinhaBiografiaDto {
    @IsString() @MinLength(0) @MaxLength(5000)
    biografia: string;
}
