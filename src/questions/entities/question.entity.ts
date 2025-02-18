import { Content } from 'src/core/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';

@Entity()
export class Question extends Content {
  @Column({ unique: true })
  title: string;

  @ManyToOne(() => User, (user: User) => user.questions, { nullable: false })
  author: User;

  @Column('text', { array: true })
  tags: string[];

  @OneToMany(() => Answer, (answer: Answer) => answer.bestForQuestion)
  bestAnswer: Answer;

  @OneToMany(() => Answer, (answer: Answer) => answer.question)
  answers: Answer[];

  answersCount: number;
}
