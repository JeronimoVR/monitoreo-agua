import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateConfigAlertaDto {
  @IsBoolean()
  @IsNotEmpty()
  recibeAlerta: boolean;
}