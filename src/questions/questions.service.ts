import { Inject, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { AlreadyExistsError, FkViolationError } from 'src/core/storage';
import { FindAllQuestionsDto } from './dto/find-all-questions.dto';
import { UserNotFoundError } from 'src/users/users.service';
import {
  IQuestionsRepository,
  IQuestionsRepositoryToken,
  IAnswersRepository,
  IAnswerGeneratorToken,
  IAnswerGenerator,
  IAnswersRepositoryToken,
  IBackgroundRunnerToken,
  IBackgroundRunner,
  IUsersRepository,
  IUsersRepositoryToken,
} from './questions.types';

class QuestionsServiceError extends Error { }

export class QuestionAlreadyExistsError extends QuestionsServiceError { }

export class QuestionNotFoundError extends QuestionsServiceError { }

@Injectable()
export class QuestionsService {
  @Inject(IQuestionsRepositoryToken)
  private questionsRepo: IQuestionsRepository;
  @Inject(IAnswersRepositoryToken) private answersRepo: IAnswersRepository;
  @Inject(IUsersRepositoryToken) private usersRepo: IUsersRepository;
  @Inject(IAnswerGeneratorToken) private answerGenerator: IAnswerGenerator;
  @Inject(IBackgroundRunnerToken) private backgroundRunner: IBackgroundRunner;

  async create(dto: CreateQuestionDto, authorId: number): Promise<Question> {
    return this.questionsRepo
      .insert(dto, authorId)
      .then((question) => {
        const task = async () => {
          const answerText =
            await this.answerGenerator.generateAnswerForQuestion(question);
          const authorID = await this.usersRepo.getBotAccID();
          await this.answersRepo.addForQuestion(
            question.id,
            authorID,
            answerText,
          );
        };
        this.backgroundRunner.runInBackground(task, "generate answer");
        return question;
      })
      .catch((err) => {
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
