import { InjectRepository } from '@nestjs/typeorm';
import {
  AlreadyExistsError,
  NotFoundError,
  getErrCode,
  isQueryFailed,
  PostgresErrorCodes,
} from '../core/storage';
import { User, UserRole } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { IUsersRepository } from './users.types';
import { SignUpDTO } from './dto/signup.dto';

export class UsersRepository implements IUsersRepository {
  @InjectRepository(User) private usersRepo: Repository<User>;
  async insert(dto: SignUpDTO, passwordHash: string, role?: UserRole): Promise<User> {
    try {
      const res = await this.usersRepo.insert({ ...dto, passwordHash, role });
      return this.usersRepo.create({ ...res.generatedMaps[0], ...dto, passwordHash: undefined });
    } catch (err) {
      if (
        isQueryFailed(err) &&
        getErrCode(err) === PostgresErrorCodes.UNIQUE_VIOLATION
      ) {
        throw new AlreadyExistsError(
          `User with email=${dto.email} or username=${dto.username} already exists`,
        );
      }
      throw err;
    }
  }

  private async getOne(options: FindOneOptions<User>) {
    const user = await this.usersRepo.findOne(options);
    if (user === null) {
      const filterPairs = Object.entries(options).map(
        ([key, value]) => `${key}=${value}`,
      );
      throw new NotFoundError(
        `User with ${filterPairs.join(' ')} does not exist`,
      );
    }
    return user;
  }

  async getByEmail(email: string): Promise<User> {
    return await this.getOne({ where: { email } });
  }

  async getById(userId: number): Promise<User> {
    return await this.getOne({
      where: { id: userId },
      relations: { questions: true },
    });
  }

  async getBotAccID(): Promise<number> {
    const userObj = await this.getOne({
      where: { role: UserRole.BOT },
      select: { id: true },
    });
    return userObj.id;
  }

  async getUserRole(userId: number): Promise<UserRole> {
    const userObj = await this.getOne({
      where: { id: userId },
      select: { role: true },
    });
    return userObj.role;
  }
}
