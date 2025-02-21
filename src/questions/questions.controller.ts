import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  QuestionAlreadyExistsError,
  QuestionNotFoundError,
  QuestionsService,
} from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FindAllQuestionsDto } from './dto/find-all-questions.dto';
import { UserNotFoundError } from 'src/users/users.service';
import { ParseIdPipe } from 'src/core/parse-id.pipe';

@Controller('/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return this.questionsService
      .create(dto)
      .then((question) => {
        return { question };
      })
      .catch((err) => {
        const fail = (code: number) => {
          throw new HttpException(err.message, code);
        };
        switch (true) {
          case err instanceof QuestionAlreadyExistsError:
            fail(HttpStatus.CONFLICT);
          case err instanceof UserNotFoundError:
            fail(HttpStatus.BAD_REQUEST);
        }
        throw err;
      });
  }

  @Get()
  async findAll(@Query() dto: FindAllQuestionsDto) {
    return this.questionsService.findAll(dto);
  }

  @Get('/:id')
  async getOne(@Param('id', ParseIdPipe) id: number) {
    return this.questionsService.getOne(id).catch((err) => {
      if (err instanceof QuestionNotFoundError) {
        throw new HttpException(err.message, 404);
      }
    });
  }
  @Get("/get-by-ids")
  async getByIds(@Query("ids", new ParseArrayPipe({ items: Number })) ids: number[]) {
    return this.questionsService.getByIds(ids)
  }

}
