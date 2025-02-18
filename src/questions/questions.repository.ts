import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { getErrCode, isQueryFailed } from 'src/core/typeorm-utils';
import { FkViolationError, PostgresErrorCodes } from 'src/core/storage';
import { AlreadyExistsError } from '../core/storage';
import { IQuestionsRepository } from './questions.service';
import { FindAllQuestionsDto } from './dto/find-all-questions.dto';

@Injectable()
export class TypeOrmQuestionsRepository implements IQuestionsRepository {
  constructor(
    @InjectRepository(Question) private questionsRepo: Repository<Question>,
  ) { }

  async insert(dto: CreateQuestionDto): Promise<Question> {
    return this.questionsRepo
      .insert({ ...dto, author: { id: dto.authorId } })
      .then((res) => {
        const questionData = { ...res.generatedMaps[0], ...dto };
        return this.questionsRepo.create(questionData);
      })
      .catch((err) => {
        console.log('TypeOrmQuestionsRepository.insert, error:', err);
        if (isQueryFailed(err)) {
          switch (getErrCode(err)) {
            case PostgresErrorCodes.UNIQUE_VIOLATION:
              throw new AlreadyExistsError(
                `Question '${dto.title}' already exists`,
              );
            case PostgresErrorCodes.FK_VIOLATION:
              throw new FkViolationError(
                `Author with id ${dto.authorId} doesn't exist`,
              );
          }
        }
        throw err;
      });
  }

  private async buildQueryForFindAll(
    dto: FindAllQuestionsDto,
  ): Promise<SelectQueryBuilder<Question>> {
    let queryBuilder = this.questionsRepo
      .createQueryBuilder('question')
      .innerJoinAndSelect('question.author', 'author')
      .loadRelationCountAndMap('question.answersCount', 'question.answers');
    switch (dto.sort) {
      case 'mostAnswers':
        queryBuilder = queryBuilder
          .addSelect((qb) => {
            return qb
              .select('COUNT(answer.id)')
              .from('answer', 'answer')
              .where('answer.questionId = question.id');
          }, 'question_answers_count')
          .orderBy('question_answers_count', 'DESC');
        break;
      case 'newest':
        queryBuilder = queryBuilder.orderBy('question.createdAt', 'DESC');
    }
    return queryBuilder
      .where('question.tags && :tags', { tags: dto.tags })
      .orWhere(':tags IS NULL', { tags: dto.tags });
  }

  async findAll(dto: FindAllQuestionsDto): Promise<Question[]> {
    const queryBuilder = await this.buildQueryForFindAll(dto);
    return await queryBuilder
      .take(dto.pageSize)
      .skip((dto.pageNum - 1) * dto.pageSize)
      .getMany();
  }

  async getOne(id: number): Promise<Question | null> {
    const queryBuilder = this.questionsRepo
      .createQueryBuilder('question')
      .innerJoinAndSelect('question.author', 'author')
      .loadRelationCountAndMap('question.answersCount', 'question.answers')
      .where('question.id = :id', { id });
    return await queryBuilder.getOne();
  }
  async getByIds(ids: number[]): Promise<Question[]> {
    return await this.questionsRepo.createQueryBuilder("question")
      .innerJoinAndSelect('question.author', 'author')
      .where("question.id IN (:...ids)", { ids })
      .getMany()
  }

}
