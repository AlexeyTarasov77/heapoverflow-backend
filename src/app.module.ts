import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsModule } from './questions/questions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configLoader } from './config';
import { Question } from './questions/entities/question.entity';
import { Answer } from './questions/entities/answer.entity';
import { Collection } from './questions/entities/collection.entity';
import { SavedAnswer } from './questions/entities/saved-answer.entity';
import { Comment } from './questions/entities/comment.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    QuestionsModule,
    ConfigModule.forRoot({
      load: [configLoader(process.env.CONFIG_PATH)],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('db.name'),
        entities: [Answer, User, Question, Comment, Collection, SavedAnswer],
        synchronize: !configService.get<boolean>('prod'),
      }),
    }),
  ],
})
export class AppModule {}
