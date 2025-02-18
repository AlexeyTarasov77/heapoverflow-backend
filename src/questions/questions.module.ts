import { Module } from '@nestjs/common';
import {
  IQuestionsRepositoryToken,
  QuestionsService,
} from './questions.service';
import { QuestionsController } from './questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { TypeOrmQuestionsRepository } from './questions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  providers: [
    QuestionsService,
    {
      provide: IQuestionsRepositoryToken,
      useClass: TypeOrmQuestionsRepository,
    },
  ],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
