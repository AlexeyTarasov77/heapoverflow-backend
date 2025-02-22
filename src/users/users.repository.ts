import { InjectRepository } from "@nestjs/typeorm";
import { AlreadyExistsError, getErrCode, isQueryFailed, PostgresErrorCodes } from '../core/storage';
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { IUsersRepository } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";

export class UsersRepository implements IUsersRepository {
  @InjectRepository(User) private usersRepo: Repository<User>;
  async insert(dto: CreateUserDTO, passwordHash: string): Promise<User> {
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
}
