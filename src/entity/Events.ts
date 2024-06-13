import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Events {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column()
  ownerId: number;

  @OneToOne(() => Post, (post) => post.events)
  @JoinColumn()
  post: Post;

  @Column("simple-array", { nullable: true })
  friendsId: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
