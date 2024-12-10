import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Snippet } from './snippet.entity';

@Entity()
export class SavedSnippet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Snippet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'snippetId' })
  snippet: Snippet;

  @CreateDateColumn()
  savedAt: Date;
}
