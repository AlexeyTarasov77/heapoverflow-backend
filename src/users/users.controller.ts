import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Res, UseGuards } from "@nestjs/common";
import { InvalidCredentialsError, UserAlreadyExistsError, UserNotFoundError, UsersService } from "./users.service";
import { SignUpDTO } from "./dto/signup.dto";
import { SignInDTO } from "./dto/signin.dto";
import { Response } from "express";
import { AuthGuard } from "src/core/middlewares";

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

  @UseGuards(AuthGuard)
  @Get("/me")
  async getAuthenticatedUser(@Res({ passthrough: true }) res: Response) {
    try {
      const user = await this.usersService.getById(res.locals.userId)
      return { success: true, data: user }
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new HttpException({ success: false, message: "User associated with provided token does not exist. Token is not valid!" }, HttpStatus.BAD_REQUEST)
      }
      throw err;
    }
  }
} 
