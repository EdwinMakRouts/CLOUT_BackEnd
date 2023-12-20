import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { Profile } from "./Profile";
import { Post } from "./Post";
import { Followers } from "./Followers";
import { PostLikes } from "./PostLikes";
import { Comment } from "./Comment";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({ length: 50 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => PostLikes, (postLike) => postLike.user)
  likes: PostLikes[];

  @OneToOne(() => Profile, { cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // Relación uno a muchos con Follower
  @OneToMany(() => Followers, (follower) => follower.user, {
    cascade: true,
    onDelete: "CASCADE",
  })
  followers: Followers[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
