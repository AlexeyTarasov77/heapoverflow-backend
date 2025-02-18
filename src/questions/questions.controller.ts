import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
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

@Controller('/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    console.log(dto);
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
  async getOne(@Param('id') id: string) {
    const idNum = Number(id);
    if (Number.isNaN(idNum) || idNum < 1) {
      throw new HttpException(
        `Invalid id param: ${id}. Id should be a valid interger and > 0`,
        400,
      );
    }
    return this.questionsService.getOne(idNum).catch((err) => {
      if (err instanceof QuestionNotFoundError) {
        throw new HttpException(err.message, 404);
      }
    });
  }
  @Get("/get-by-ids")
  async getByIds(@Query("ids") ids: string[]) {
    if (typeof ids === "string") {
      ids = [ids]
    }
    console.log("ids", ids, "typeof ids", typeof ids, "isarray", Array.isArray(ids))
    const idsInt = ids.map(Number)
    return this.questionsService.getByIds(idsInt)
  }

}
