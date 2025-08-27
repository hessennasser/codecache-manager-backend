import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tag } from "./tag.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
@Index(["title"])
export class Snippet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column("text")
  content: string;

  @ManyToMany(() => Tag, (tag) => tag.snippets)
  @JoinTable()
  tags: Tag[];

  @Column()
  @Index()
  programmingLanguage: string;

  @ManyToOne(() => User, (user) => user.snippets)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  @Index()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
