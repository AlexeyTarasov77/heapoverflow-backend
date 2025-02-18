import { TimestampedModel } from 'src/core/entities/timestamped-model.entity';
import { Answer } from 'src/questions/entities/answer.entity';
import { Question } from 'src/questions/entities/question.entity';
import { SavedAnswer } from 'src/questions/entities/saved-answer.entity';
import { Comment } from 'src/questions/entities/comment.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum UserRole {
  USER = 1,
  MODERATOR = 2,
  ADMIN = 3,
}

@Entity()
export class User extends TimestampedModel {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: 0 })
  reputation: number;

  @Column({ nullable: true })
  location: string;

  @OneToMany(() => Question, (question: Question) => question.author)
  questions: Question[];

  @OneToMany(() => Answer, (answer: Answer) => answer.author)
  answers: Answer[];

  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(() => SavedAnswer, (answer: SavedAnswer) => answer.user)
  savedAnswers: SavedAnswer[];

  @OneToMany(() => Comment, (comment: Comment) => comment.author)
  comments: Comment[];
}
