import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseArrayPipe,
  Post,
  Query,
  Res,
  UseGuards,
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
import { AuthGuard } from 'src/core/middlewares';
import { Response } from 'express';
import { getSuccededResponse } from 'src/core/utils';

@Controller('/questions')
export class QuestionsController {
  @Inject() private readonly questionsService: QuestionsService;

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateQuestionDto,
  ) {
    try {
      const question = await this.questionsService.create(
        dto,
        res.locals.userId,
      );
      return getSuccededResponse(question);
    } catch (err) {
      const fail = (code: number) => {
        throw new HttpException({ success: false, message: err.message }, code);
      };
      switch (true) {
        case err instanceof QuestionAlreadyExistsError:
          fail(HttpStatus.CONFLICT);
        case err instanceof UserNotFoundError:
          fail(HttpStatus.BAD_REQUEST);
      }
      throw err;
    }
  }
  @Get()
  async findAll(@Query() dto: FindAllQuestionsDto) {
    const questions = await this.questionsService.findAll(dto);
    return getSuccededResponse(questions);
  }

  @Get('/:id')
  async getOne(@Param('id', ParseIdPipe) id: number) {
    try {
      const question = await this.questionsService.getOne(id);
      return getSuccededResponse(question);
    } catch (err) {
      if (err instanceof QuestionNotFoundError) {
        throw new HttpException(err.message, HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }

  @Get('/get-by-ids')
  async getByIds(
    @Query('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ) {
    const questions = await this.questionsService.getByIds(ids);
    return getSuccededResponse(questions);
  }
}
