import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  pinterest: string;

  @Column({ nullable: true })
  bornDate: Date;

  @OneToOne(() => User, (user) => user.profile)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
