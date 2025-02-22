import { Body, Controller, HttpException, HttpStatus, Inject, Post } from "@nestjs/common";
import { UserAlreadyExistsError, UsersService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";

@Controller('/users')
export class UsersController {
  @Inject(UsersService) private readonly usersService: UsersService;

  @Post("/signup")
  async signUp(@Body() dto: CreateUserDTO) {
    try {
      const user = await this.usersService.signUp(dto)
      return { success: true, user }
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        throw new HttpException({ success: false, message: err.message }, HttpStatus.CONFLICT)
      }
      throw err;
    }
  }
} 
