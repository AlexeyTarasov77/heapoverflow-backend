import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IHasherToken,
  ITokenProviderToken,
  IUsersRepositoryToken,
} from './users.types';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { BcryptHasher } from './hashing';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { JwtTokenProvider } from './tokens';
import { ConfigService } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';
import { AuthMiddleware } from 'src/core/middlewares';

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
    {
      provide: ITokenProviderToken,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new JwtTokenProvider(
          configService.get<string>('jwt_secret'),
          configService.get<Algorithm | undefined>('jwt_alg'),
        ),
    },
  ],
  controllers: [UsersController],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
