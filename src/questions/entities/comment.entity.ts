import { Content } from 'src/core/entities/content.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Comment extends Content {
  @ManyToOne(() => Comment, (comment: Comment) => comment.replies)
  parentComment: Comment;

  @OneToMany(() => Comment, (comment: Comment) => comment.parentComment)
  replies: Comment[];

  @ManyToOne(() => User, (user: User) => user.comments, { nullable: false })
  author: User;
}
