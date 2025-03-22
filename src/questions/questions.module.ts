import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { AnswersRepository, QuestionsRepository } from './questions.repository';
import { QuestionsController } from './questions.controller';
import { LlamaAPIClient } from './questions.ai-client';
import {
  IAnswerGeneratorToken,
  IAnswersRepositoryToken,
  IBackgroundRunnerToken,
  IQuestionsRepositoryToken,
  IUsersRepositoryToken,
} from './questions.types';
import { backgroundRunner } from 'src/core/background-runner';
import { UsersRepository } from 'src/users/users.repository';
import { User } from 'src/users/entities/user.entity';
import { Answer } from './entities/answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, User, Answer])],
  providers: [
    QuestionsService,
    {
      provide: IQuestionsRepositoryToken,
      useClass: QuestionsRepository,
    },
    {
      provide: IAnswerGeneratorToken,
      useClass: LlamaAPIClient,
    },
    {
      provide: IUsersRepositoryToken,
      useClass: UsersRepository,
    },
    {
      provide: IBackgroundRunnerToken,
      useClass: backgroundRunner,
    },
    {
      provide: IAnswersRepositoryToken,
      useClass: AnswersRepository,
    },
    {
      provide: IUsersRepositoryToken,
      useClass: UsersRepository,
    },
  ],
  controllers: [QuestionsController],
})
export class QuestionsModule { }
