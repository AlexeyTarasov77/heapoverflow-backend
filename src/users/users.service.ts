import { Inject, Injectable } from '@nestjs/common';
import { StringValue } from 'ms';
import { User, UserRole } from './entities/user.entity';
import { AlreadyExistsError, NotFoundError } from 'src/core/storage';
import { SignUpDTO } from './dto/signup.dto';
import { SignInDTO } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';
import {
  IUsersRepositoryToken,
  IHasherToken,
  ITokenProviderToken,
  ITokenProvider,
  IUsersRepository,
  IHasher,
} from './users.types';

class UsersServiceError extends Error { }

export class InvalidTokenError extends UsersServiceError {
  constructor() {
    super('Token is invalid');
  }
}

export class ExpiredTokenError extends UsersServiceError {
  constructor() {
    super('Token is expired');
  }
}

export class InvalidCredentialsError extends UsersServiceError {
  constructor() {
    super('Invalid email or password');
  }
}
export class UserNotFoundError extends UsersServiceError { }
export class UserAlreadyExistsError extends UsersServiceError { }

@Injectable()
export class UsersService {
  @Inject(IUsersRepositoryToken) private usersRepo: IUsersRepository;
  @Inject(IHasherToken) private hasher: IHasher;
  @Inject(ITokenProviderToken) private tokenProvider: ITokenProvider;
  @Inject(ConfigService) private config: ConfigService;

  async createBot(username: string): Promise<User> {
    const email = username + '@bot.com';
    const passwordHash = await this.hasher.hash('botpassword');
    try {
      return await this.usersRepo.insert(
        { username, email, password: '', location: '', imageUrl: '' },
        passwordHash,
        UserRole.BOT,
      );
    } catch (err) {
      if (err instanceof AlreadyExistsError) {
        throw new UserAlreadyExistsError(err.message);
      }
      throw err;
    }
  }

  async signIn(dto: SignInDTO): Promise<string> {
    try {
      var user = await this.usersRepo.getByEmail(dto.email);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new InvalidCredentialsError();
      }
      throw err;
    }
    // permit login from bot account
    if (user.role === UserRole.BOT) {
      throw new InvalidCredentialsError();
    }
    const passwordsEqual = await this.hasher.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordsEqual) {
      throw new InvalidCredentialsError();
    }
    const tokenTTL: StringValue =
      this.config.get<StringValue>('auth_token_ttl');
    const token = await this.tokenProvider.create({ uid: user.id }, tokenTTL);
    return token;
  }
  async signUp(dto: SignUpDTO): Promise<User> {
    const passwordHash = await this.hasher.hash(dto.password);
    try {
      return await this.usersRepo.insert(dto, passwordHash);
    } catch (err) {
      if (err instanceof AlreadyExistsError) {
        throw new UserAlreadyExistsError(err.message);
      }
      throw err;
    }
  }

  async getById(userId: number): Promise<User> {
    try {
      var user = await this.usersRepo.getById(userId);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new UserNotFoundError();
      }
      throw err;
    }
    return user;
  }
}
