import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const questionsSortOptions = ['mostAnswers', 'newest'];

export class FindAllQuestionsDto {
  @IsIn(questionsSortOptions)
  @IsString()
  @IsOptional()
  readonly sort: string;

  @Min(1)
  @IsInt()
  @IsOptional()
  readonly pageNum: number = 1;

  @Min(5)
  @IsInt()
  @IsOptional()
  readonly pageSize: number = 10;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly tags: string[];
}
