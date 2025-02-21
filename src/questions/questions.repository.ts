import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { getErrCode, isQueryFailed } from 'src/core/typeorm-utils';
import { FkViolationError, PostgresErrorCodes } from 'src/core/storage';
import { AlreadyExistsError } from '../core/storage';
import { IQuestionsRepository } from './questions.service';
import { FindAllQuestionsDto, QuestionFilterOptions, QuestionSortOptions } from './dto/find-all-questions.dto';
import { Answer } from './entities/answer.entity';

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
      .leftJoin(Answer, "ans", 'ans."questionId" = question.id')
      .addSelect("COUNT(ans.id)", "answersCount")
      .groupBy("question.id")
      .addGroupBy("author.id")
    switch (dto.sort) {
      case QuestionSortOptions.MOST_ANSWERS:
        queryBuilder = queryBuilder.orderBy('answersCount', 'DESC');
        break;
      case QuestionSortOptions.NEWEST:
        queryBuilder = queryBuilder.orderBy('question.createdAt', 'DESC');
        break;
    }
    queryBuilder = queryBuilder.where('question.tags && :tags', { tags: dto.tags })
      .orWhere(':tags IS NULL', { tags: dto.tags });

    switch (dto.filter) {
      case QuestionFilterOptions.UNANSWERED:
        queryBuilder = queryBuilder.having('COUNT(ans.id) = 0')
    }
    return queryBuilder
  }

  async findAll(dto: FindAllQuestionsDto): Promise<Question[]> {
    const queryBuilder = await this.buildQueryForFindAll(dto);
    const rawRes = await queryBuilder
      .take(dto.pageSize)
      .skip((dto.pageNum - 1) * dto.pageSize)
      .getRawAndEntities();
    rawRes.entities.forEach((ent, i) => ent.answersCount = rawRes.raw[i]["answersCount"])
    return rawRes.entities
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
