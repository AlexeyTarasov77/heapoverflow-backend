import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SavedAnswer } from './saved-answer.entity';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => SavedAnswer, (answer: SavedAnswer) => answer.collection)
  savedAnswers: SavedAnswer[];
}
