import { InjectRepository } from "@nestjs/typeorm";
import { AlreadyExistsError, NotFoundError, getErrCode, isQueryFailed, PostgresErrorCodes } from '../core/storage';
import { User } from "./entities/user.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { IUsersRepository } from "./users.service";
import { SignUpDTO } from "./dto/signup.dto";

export class UsersRepository implements IUsersRepository {
  @InjectRepository(User) private usersRepo: Repository<User>;
  async insert(dto: SignUpDTO, passwordHash: string): Promise<User> {
    try {
      const res = await this.usersRepo.insert({ ...dto, passwordHash });
      return this.usersRepo.create({ ...res.generatedMaps[0], ...dto });
    } catch (err) {
      if (isQueryFailed(err) && getErrCode(err) === PostgresErrorCodes.UNIQUE_VIOLATION) {
        throw new AlreadyExistsError(`User with email=${dto.email} or username=${dto.username} already exists`)
      }
      throw err;
    }
  }

  private async getOne(options: FindOptionsWhere<User>) {
    const user = await this.usersRepo.findOneBy(options)
    if (user === null) {
      const filterPairs = Object.entries(options).map(([key, value]) => `${key}=${value}`)
      throw new NotFoundError(`User with ${filterPairs.join(' ')} does not exist`)
    }
    return user
  }

  async getByEmail(email: string): Promise<User> {
    return await this.getOne({ email })
  }

  async getById(userId: number): Promise<User> {
    return await this.getOne({ id: userId })
  }
}
