import { ArrayMinSize, IsArray, IsNotEmpty, Length } from 'class-validator';

export class CreateQuestionDto {
  @Length(10, 100)
  @IsNotEmpty()
  readonly title: string;

  @Length(20, 1000)
  @IsNotEmpty()
  readonly body: string;

  @ArrayMinSize(1)
  @IsArray()
  readonly tags: string[];
}
