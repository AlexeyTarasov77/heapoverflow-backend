import { Inject, Injectable } from "@nestjs/common";
import { StringValue } from "ms"
import { User } from "./entities/user.entity";
import { AlreadyExistsError } from "src/core/storage";
import { SignUpDTO } from "./dto/signup.dto";
import { SignInDTO } from "./dto/signin.dto";
import { NotFoundError } from "rxjs";
import { ConfigService } from "@nestjs/config";

class UsersServiceError extends Error { }

export class InvalidCredentialsError extends UsersServiceError {
  constructor() {
    super("Invalid email or password")
  }
}
export class UserNotFoundError extends UsersServiceError { }
export class UserAlreadyExistsError extends UsersServiceError { }

export interface IUsersRepository {
  insert(dto: SignUpDTO, passwordHash: string): Promise<User>
  getByEmail(email: string): Promise<User>
}

export type TokenPayload = Record<string, any>

export interface ITokenProvider {
  create(payload: TokenPayload, ttl: StringValue): Promise<string>;
  parse(token: string, secret: string): Promise<TokenPayload>
}

export interface IHasher {
  hash(s: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>
}

export const IUsersRepositoryToken = Symbol('IUsersRepository');
export const IHasherToken = Symbol('IHasher')
export const ITokenProviderToken = Symbol('ITokenProvider')

@Injectable()
export class UsersService {
  @Inject(IUsersRepositoryToken) private usersRepo: IUsersRepository;
  @Inject(IHasherToken) private hasher: IHasher;
  @Inject(ITokenProviderToken) private tokenProvider: ITokenProvider;
  @Inject(ConfigService) private config: ConfigService


  async signIn(dto: SignInDTO): Promise<string> {
    try {
      var user = await this.usersRepo.getByEmail(dto.email)
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new InvalidCredentialsError()
      }
      throw err
    }
    const passwordsEqual = await this.hasher.compare(dto.password, user.passwordHash)
    if (!passwordsEqual) {
      throw new InvalidCredentialsError()
    }
    const tokenTTL: StringValue = this.config.get<StringValue>("auth_token_ttl")
    const token = await this.tokenProvider.create({ uid: user.id }, tokenTTL)
    return token
  }
  async signUp(dto: SignUpDTO): Promise<User> {
    const passwordHash = await this.hasher.hash(dto.password)
    try {
      return await this.usersRepo.insert(dto, passwordHash)
    } catch (err) {
      if (err instanceof AlreadyExistsError) {
        throw new UserAlreadyExistsError(err.message)
      }
      throw err;
    }
  }
}
