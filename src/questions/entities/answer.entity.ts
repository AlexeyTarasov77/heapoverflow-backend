import { Content } from 'src/core/entities/content.entity';
import { Question } from './question.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { SavedAnswer } from './saved-answer.entity';

@Entity()
export class Answer extends Content {
  @ManyToOne(() => Question, (question: Question) => question.answers, {
    nullable: false,
  })
  question: Question;

  @OneToMany(() => Question, (question: Question) => question.bestAnswer)
  bestForQuestion: Question;

  @Column()
  upvotes: number;

  @ManyToOne(() => User, (user: User) => user.answers, { nullable: false })
  author: User;

  @OneToMany(() => SavedAnswer, (answer: SavedAnswer) => answer.answer)
  savedByUsers: User[];
}
