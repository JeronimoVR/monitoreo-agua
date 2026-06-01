import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La contraseña debe ser de al menos 8 caracteres' })
    password!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La nueva contraseña debe ser de al menos 8 caracteres' })
    nuevaPassword!: string;
}