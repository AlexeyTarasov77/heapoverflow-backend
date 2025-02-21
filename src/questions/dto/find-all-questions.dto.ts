import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';


export enum QuestionFilterOptions {
  UNANSWERED = "unanswered"
}

export enum QuestionSortOptions {
  MOST_ANSWERS = "mostAnswers",
  NEWEST = "newest"
}

export class FindAllQuestionsDto {
  @IsIn(Object.values(QuestionSortOptions))
  @IsString()
  @IsOptional()
  readonly sort: string;

  @IsIn(Object.values(QuestionFilterOptions))
  @IsString()
  @IsOptional()
  readonly filter: string;


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
