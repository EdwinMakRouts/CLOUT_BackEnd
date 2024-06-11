import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class PostLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @ManyToOne(() => Post, (post) => post.postLikes)
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
