import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSnippet } from '../entities/saved-snippet.entity';
import { User } from '../../users/entities/user.entity';
import { Snippet } from '../entities/snippet.entity';

@Injectable()
export class SavedSnippetsService {
  constructor(
    @InjectRepository(SavedSnippet)
    private savedSnippetRepository: Repository<SavedSnippet>,
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
  ) {}

  async saveSnippet(userId: string, snippetId: string): Promise<SavedSnippet> {
    const snippet = await this.snippetRepository.findOne({ where: { id: snippetId } });
    if (!snippet) {
      throw new NotFoundException('Snippet not found');
    }

    const savedSnippet = this.savedSnippetRepository.create({
      user: { id: userId },
      snippet: { id: snippetId },
    });

    return this.savedSnippetRepository.save(savedSnippet);
  }

  async unsaveSnippet(userId: string, snippetId: string): Promise<void> {
    const savedSnippet = await this.savedSnippetRepository.findOne({
      where: {
        user: { id: userId },
        snippet: { id: snippetId },
      },
    });

    if (!savedSnippet) {
      throw new NotFoundException('Saved snippet not found');
    }

    await this.savedSnippetRepository.remove(savedSnippet);
  }

  async getUserSavedSnippets(userId: string, page = 1, limit = 10) {
    const [snippets, total] = await this.savedSnippetRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['snippet', 'snippet.user', 'snippet.tags'],
      skip: (page - 1) * limit,
      take: limit,
      order: { savedAt: 'DESC' },
    });

    return {
      snippets: snippets.map(saved => saved.snippet),
      /*
       {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	}
      */
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async isSnippetSaved(userId: string, snippetId: string): Promise<boolean> {
    const count = await this.savedSnippetRepository.count({
      where: {
        user: { id: userId },
        snippet: { id: snippetId },
      },
    });
    return count > 0;
  }
}
