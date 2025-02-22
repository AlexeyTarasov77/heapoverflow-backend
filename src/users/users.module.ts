
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IHasherToken, IUsersRepositoryToken, UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { BcryptHasher } from './hashing';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    {
      provide: IUsersRepositoryToken,
      useClass: UsersRepository,
    },
    {
      provide: IHasherToken,
      useClass: BcryptHasher,
    },

  ],
  controllers: [UsersController],
})
export class UsersModule { }
