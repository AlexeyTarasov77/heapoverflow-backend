import { PrimaryColumn, Entity, ManyToOne } from 'typeorm';
import { Answer } from './answer.entity';
import { User } from 'src/users/entities/user.entity';
import { Collection } from './collection.entity';

@Entity()
export class SavedAnswer {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  answerId: number;

  @ManyToOne(() => Answer, (answer: Answer) => answer.savedByUsers, {
    nullable: false,
  })
  answer: Answer;

  @ManyToOne(() => User, (user: User) => user.savedAnswers, { nullable: false })
  user: User;

  @ManyToOne(
    () => Collection,
    (collection: Collection) => collection.savedAnswers,
    { nullable: false },
  )
  collection: Collection;
}
