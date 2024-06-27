import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Message } from "./Message";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @Column()
  lastMessageDate: Date;

  @Column()
  userId_1: number;

  @Column({ nullable: true })
  lastConnectionUser_1: Date;

  @Column()
  userId_2: number;

  @Column({ nullable: true })
  lastConnectionUser_2: Date;
}
