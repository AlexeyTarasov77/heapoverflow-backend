import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
  UsersService,
} from './users.service';
import { SignUpDTO } from './dto/signup.dto';
import { SignInDTO } from './dto/signin.dto';
import { Response } from 'express';
import { AuthGuard, MinRole, RolesGuard } from 'src/core/middlewares';
import { getSuccededResponse } from 'src/core/utils';
import { UserRole } from './entities/user.entity';
import { IsNotEmpty } from 'class-validator';
import { CheckNotEmptyPipe } from 'src/core/parse-id.pipe';

@Controller('/users')
export class UsersController {
  @Inject(UsersService) private readonly usersService: UsersService;

  @Post('/signup')
  async signUp(@Body() dto: SignUpDTO) {
    try {
      const user = await this.usersService.signUp(dto);
      return getSuccededResponse(user);
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  @Post('/signin')
  async signIn(@Body() dto: SignInDTO) {
    try {
      const token = await this.usersService.signIn(dto);
      return getSuccededResponse(token);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
      }
      throw err;
    }
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getAuthenticatedUser(@Res({ passthrough: true }) res: Response) {
    try {
      const user = await this.usersService.getById(res.locals.userId);
      return getSuccededResponse(user);
    } catch (err) {
      if (err instanceof UserNotFoundError) {
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      }
      throw err;
    }
  }

  @UseGuards(RolesGuard)
  @MinRole(UserRole.ADMIN)
  @Post("/create-bot")
  async createBot(@Body("username", CheckNotEmptyPipe) username: string) {
    try {
      const user = await this.usersService.createBot(username);
      return getSuccededResponse(user);
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
      }
      throw err;
    }
  }
}
