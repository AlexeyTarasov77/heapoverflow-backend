import { Inject, Injectable } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { AlreadyExistsError } from "src/core/storage";

class UsersServiceError extends Error { }

export class UserNotFoundError extends UsersServiceError { }
export class UserAlreadyExistsError extends UsersServiceError { }

export interface IUsersRepository {
  insert(dto: CreateUserDTO, passwordHash: string): Promise<User>
}

export interface IHasher {
  hash(s: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>
}

export const IUsersRepositoryToken = Symbol('IUsersRepository');
export const IHasherToken = Symbol('IHasher')

@Injectable()
export class UsersService {
  @Inject(IUsersRepositoryToken) private usersRepo: IUsersRepository;
  @Inject(IHasherToken) private hasher: IHasher;

  async signIn() { }
  async signUp(dto: CreateUserDTO): Promise<User> {
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
