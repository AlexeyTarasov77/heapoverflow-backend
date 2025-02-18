import { Column } from 'typeorm';
import { TimestampedModel } from './timestamped-model.entity';

export abstract class Content extends TimestampedModel {
  @Column()
  body: string;
}
