import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Snippet } from "src/snippets/entities/snippet.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ nullable: true, length: 100 })
  position: string;

  @Column({ nullable: true, length: 100 })
  companyName: string;

  @Column({ nullable: true, length: 100 })
  companyWebsite: string;

  @Column({ unique: true, length: 30 })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: "enum", enum: ["user", "admin"], default: "user" })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Snippet, (snippet) => snippet.user)
  snippets: Snippet[];
}
