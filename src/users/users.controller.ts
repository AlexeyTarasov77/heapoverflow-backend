import { Body, Controller, HttpException, HttpStatus, Inject, Post } from "@nestjs/common";
import { InvalidCredentialsError, UserAlreadyExistsError, UsersService } from "./users.service";
import { SignUpDTO } from "./dto/signup.dto";
import { SignInDTO } from "./dto/signin.dto";

@Controller('/users')
export class UsersController {
  @Inject(UsersService) private readonly usersService: UsersService;

  @Post("/signup")
  async signUp(@Body() dto: SignUpDTO) {
    try {
      const user = await this.usersService.signUp(dto)
      return { success: true, data: user }
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        throw new HttpException({ success: false, message: err.message }, HttpStatus.CONFLICT)
      }
      throw err;
    }
  }

  @Post("/signin")
  async signIn(@Body() dto: SignInDTO) {
    try {
      const token = await this.usersService.signIn(dto)
      return { success: true, data: token }
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        throw new HttpException({ success: false, message: err.message }, HttpStatus.UNAUTHORIZED)
      }
      throw err
    }
  }
} 
