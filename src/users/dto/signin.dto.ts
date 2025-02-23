import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class SignInDTO {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @MinLength(8)
  @IsNotEmpty()
  readonly password: string;
}
