import { CreateQuestionDto } from './dto/create-question.dto';
import { FindAllQuestionsDto } from './dto/find-all-questions.dto';
import { Question } from './entities/question.entity';

export const IQuestionsRepositoryToken = Symbol('IQuestionsRepository');
export const IAnswersRepositoryToken = Symbol('IAnswersRepository ');
export const IBackgroundRunnerToken = Symbol('IBackgroundRunner');
export const IAnswerGeneratorToken = Symbol('IAnswerGenerator');
export const IUsersRepositoryToken = Symbol('IUsersRepository');

export interface IQuestionsRepository {
  insert(dto: CreateQuestionDto, authorId: number): Promise<Question>;
  findAll(dto: FindAllQuestionsDto): Promise<Question[]>;
  getOne(id: number): Promise<Question | null>;
  getByIds(ids: number[]): Promise<Question[]>;
}

export interface IAnswersRepository {
  addForQuestion(
    questionID: number,
    authorID: number,
    body: string,
  ): Promise<void>;
}

export interface IUsersRepository {
  getBotAccID(): Promise<number>;
}

export interface IBackgroundRunner {
  runInBackground<T = any>(func: () => Promise<T>, taskName?: string): Promise<T>;
}

export interface IAnswerGenerator {
  generateAnswerForQuestion(question: Question): Promise<string>;
}
