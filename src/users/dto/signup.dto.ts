import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
} from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  readonly username: string;

  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  readonly location: string;

  @IsUrl()
  @IsOptional()
  readonly imageUrl: string;
}
