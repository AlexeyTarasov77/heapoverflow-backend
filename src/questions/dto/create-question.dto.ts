import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  Length,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @Length(10, 100)
  @IsNotEmpty()
  readonly title: string;

  @Length(20, 1000)
  @IsNotEmpty()
  readonly body: string;

  @Min(1)
  @IsInt()
  readonly authorId: number;

  @ArrayMinSize(1)
  @IsArray()
  readonly tags: string[];
}
