import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { PostLikes } from "./PostLikes";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  text: string;

  @Column()
  image: string;

  @Column({ default: 0 })
  likes: number;

  @OneToMany(() => PostLikes, (postLikes) => postLikes.post, { nullable: true })
  postLikes: PostLikes[];

  @ManyToOne(() => User, (user) => user.posts, { nullable: true })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { nullable: true })
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
