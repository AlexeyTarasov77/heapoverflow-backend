import { Inject, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { AlreadyExistsError, FkViolationError } from 'src/core/storage';
import { FindAllQuestionsDto } from './dto/find-all-questions.dto';
import { UserNotFoundError } from 'src/users/users.service';

class QuestionsServiceError extends Error { }

export class QuestionAlreadyExistsError extends QuestionsServiceError { }

export class QuestionNotFoundError extends QuestionsServiceError { }

export const IQuestionsRepositoryToken = Symbol('IQuestionsRepository');

export interface IQuestionsRepository {
  insert(dto: CreateQuestionDto): Promise<Question>;
  findAll(dto: FindAllQuestionsDto): Promise<Question[]>;
  getOne(id: number): Promise<Question | null>;
  getByIds(ids: number[]): Promise<Question[]>;
}

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(IQuestionsRepositoryToken)
    private questionsRepo: IQuestionsRepository,
  ) { }
  async create(dto: CreateQuestionDto): Promise<Question> {
    return this.questionsRepo.insert(dto).catch((err) => {
      switch (true) {
        case err instanceof AlreadyExistsError:
          throw new QuestionAlreadyExistsError(err.message);
        case err instanceof FkViolationError:
          throw new UserNotFoundError(err.message);
      }
      throw err;
    });
  }

  async findAll(dto: FindAllQuestionsDto): Promise<Question[]> {
    return this.questionsRepo.findAll(dto);
  }

  async getOne(id: number): Promise<Question> {
    const question = await this.questionsRepo.getOne(id);
    if (!question) {
      throw new QuestionNotFoundError(`Question with id: ${id} not found`);
    }
    return question;
  }
  async getByIds(ids: number[]): Promise<Question[]> {
    return this.questionsRepo.getByIds(ids);
  }
}
