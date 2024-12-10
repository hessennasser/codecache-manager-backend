import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, ILike, In, Raw } from "typeorm";
import { Snippet } from "./entities/snippet.entity";
import { Tag } from "./entities/tag.entity";
import { User } from "../users/entities/user.entity";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { UpdateSnippetDto } from "./dto/update-snippet.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { SnippetFiltersDto } from "./dto/snippet-filters.dto";
import { validate as uuidValidate } from "uuid";

@Injectable()
export class SnippetsService {
  private readonly logger = new Logger(SnippetsService.name);

  constructor(
    @InjectRepository(Snippet)
    private snippetRepository: Repository<Snippet>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createSnippet(
    userId: string,
    createSnippetDto: CreateSnippetDto,
  ): Promise<{ snippet: Snippet | null; message: string }> {
    try {
      const user = await this.findUserById(userId);
      const tags = await this.handleTags(createSnippetDto.tags);

      const newSnippet = this.snippetRepository.create({
        ...createSnippetDto,
        user,
        tags,
      });

      const savedSnippet = await this.snippetRepository.save(newSnippet);
      return {
        snippet: savedSnippet,
        message: "Snippet created successfully",
      };
    } catch (error) {
      this.logger.error(
        `Error creating snippet: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        return { snippet: null, message: error.message };
      }
      throw new InternalServerErrorException(
        "An error occurred while creating the snippet",
      );
    }
  }

  async getAllSnippets(
    paginationDto: PaginationDto,
    filtersDto: SnippetFiltersDto,
  ): Promise<{
    snippets: Snippet[];
    pagination: PaginationDto & { total: number; totalPages: number };
  }> {
    const { page, limit } = paginationDto;
    const { search, tags, programmingLanguage } = filtersDto;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const query = this.buildSnippetQuery({ search, tags, programmingLanguage });
    const [snippets, total] = await this.snippetRepository.findAndCount({
      where: query,
      relations: ["tags", "user"],
      skip: (pageNumber - 1) * limitNumber,
      take: limit,
    });

    return {
      snippets,
      pagination: {
        ...paginationDto,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSnippetsByUserId(
    userId: string,
    paginationDto: PaginationDto,
    filtersDto: SnippetFiltersDto,
  ): Promise<{
    snippets: Snippet[];
    pagination: PaginationDto & { total: number; totalPages: number };
  }> {
    const { page, limit } = paginationDto;
    const { search, tags, programmingLanguage } = filtersDto;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const query = this.buildSnippetQuery({
      search,
      tags,
      programmingLanguage,
      userId,
    });
    const [snippets, total] = await this.snippetRepository.findAndCount({
      where: query,
      relations: ["tags", "user"],
      skip: (pageNumber - 1) * limitNumber,
      take: limit,
    });

    return {
      snippets,
      pagination: {
        ...paginationDto,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSnippetById(id: string): Promise<Snippet> {
    const snippet = await this.snippetRepository.findOne({
      where: { id },
      relations: ["tags", "user"],
    });

    if (!snippet) {
      throw new NotFoundException("Snippet not found");
    }

    await this.incrementSnippetViews(snippet);
    return snippet;
  }

  async updateSnippet(
    userId: string,
    id: string,
    updateSnippetDto: UpdateSnippetDto,
  ): Promise<Snippet> {
    const snippet = await this.snippetRepository.findOne({
      where: { id, userId },
      relations: ["tags"],
    });

    if (!snippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to update it",
      );
    }

    if (updateSnippetDto.tags) {
      const oldTags = snippet.tags;
      const newTags = await this.handleTags(updateSnippetDto.tags);
      await this.updateTagUsage(oldTags, newTags);
      snippet.tags = newTags;
    }

    Object.assign(snippet, updateSnippetDto);
    return this.snippetRepository.save(snippet);
  }

  async deleteSnippet(userId: string, id: string): Promise<void> {
    const snippet = await this.snippetRepository.findOne({
      where: { id, userId },
      relations: ["tags"],
    });

    if (!snippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to delete it",
      );
    }

    await this.updateTagUsage(snippet.tags, []);
    await this.snippetRepository.remove(snippet);
  }

  async getPopularSnippets(limit: number = 10): Promise<Snippet[]> {
    return this.snippetRepository.find({
      where: { isPublic: true },
      order: { viewCount: "DESC" },
      take: limit,
      relations: ["tags", "user"],
    });
  }

  async getRecentSnippets(limit: number = 10): Promise<Snippet[]> {
    return this.snippetRepository.find({
      where: { isPublic: true },
      order: { createdAt: "DESC" },
      take: limit,
      relations: ["tags", "user"],
    });
  }

  async updateSavedSnippets(
    userId: string,
    snippetId: string,
    add: boolean,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["savedSnippets"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const snippet = await this.snippetRepository.findOne({
      where: { id: snippetId },
    });

    if (!snippet) {
      throw new NotFoundException("Snippet not found");
    }

    if (add) {
      user.savedSnippets.push(snippet);
    } else {
      user.savedSnippets = user.savedSnippets.filter((s) => s.id !== snippetId);
    }

    await this.userRepository.save(user);
  }

  async getSavedSnippets(
    userId: string,
    paginationDto: PaginationDto,
    filtersDto: SnippetFiltersDto,
  ): Promise<{
    snippets: Snippet[];
    pagination: PaginationDto & { total: number; totalPages: number };
  }> {
    const { page, limit } = paginationDto;
    const { search, tags, programmingLanguage } = filtersDto;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["savedSnippets", "savedSnippets.tags", "savedSnippets.user"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    let filteredSnippets = user.savedSnippets;

    if (search) {
      filteredSnippets = filteredSnippets.filter(
        (s) =>
          s.title.includes(search) ||
          s.description?.includes(search) ||
          s.content.includes(search),
      );
    }

    if (tags && tags.length > 0) {
      filteredSnippets = filteredSnippets.filter((s) =>
        s.tags.some((t) => tags.includes(t.name)),
      );
    }

    if (programmingLanguage) {
      filteredSnippets = filteredSnippets.filter(
        (s) => s.programmingLanguage === programmingLanguage,
      );
    }

    const total = filteredSnippets.length;
    const snippets = filteredSnippets.slice(
      (pageNumber - 1) * limitNumber,
      pageNumber * limitNumber,
    );

    return {
      snippets,
      pagination: {
        ...paginationDto,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async handleTags(tagNames: string[]): Promise<Tag[]> {
    const uniqueTagNames = [
      ...new Set(tagNames.map((name) => name.toLowerCase().trim())),
    ];
    const tags: Tag[] = [];

    for (const tagName of uniqueTagNames) {
      try {
        let tag = await this.tagRepository.findOne({
          where: { name: tagName },
        });
        if (!tag) {
          tag = this.tagRepository.create({ name: tagName, usageCount: 0 });
        }
        tag.usageCount = (tag.usageCount || 0) + 1;
        await this.tagRepository.save(tag);
        tags.push(tag);
      } catch (error) {
        this.logger.error(
          `Error handling tag "${tagName}": ${error.message}`,
          error.stack,
        );
      }
    }

    return tags;
  }

  private async updateTagUsage(oldTags: Tag[], newTags: Tag[]): Promise<void> {
    const tagsToDecrement = oldTags.filter(
      (oldTag) => !newTags.some((newTag) => newTag.id === oldTag.id),
    );
    const tagsToIncrement = newTags.filter(
      (newTag) => !oldTags.some((oldTag) => oldTag.id === newTag.id),
    );

    for (const tag of tagsToDecrement) {
      tag.usageCount -= 1;
      await this.tagRepository.save(tag);
    }

    for (const tag of tagsToIncrement) {
      tag.usageCount += 1;
      await this.tagRepository.save(tag);
    }

    await this.tagRepository.delete({ usageCount: 0 });
  }

  private async incrementSnippetViews(snippet: Snippet): Promise<Snippet> {
    snippet.viewCount += 1;
    return this.snippetRepository.save(snippet);
  }

  private async findUserById(userId: string): Promise<User> {
    this.validateUserId(userId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  private validateUserId(userId: string): void {
    if (!userId || !uuidValidate(userId)) {
      throw new BadRequestException("Invalid user ID");
    }
  }

  private buildSnippetQuery(
    filters: SnippetFiltersDto & { userId?: string },
  ): FindOptionsWhere<Snippet> {
    const { search, tags, programmingLanguage, userId } = filters;
    const query: FindOptionsWhere<Snippet> = {};

    if (userId) {
      query.userId = userId;
    } else {
      query.isPublic = true;
    }

    if (search) {
      query.title = Raw(
        (alias) =>
          `(${alias} ILIKE :search OR description ILIKE :search OR content ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    if (tags && tags.length > 0) {
      query.tags = { name: In(tags) };
    }

    if (programmingLanguage && programmingLanguage !== "all") {
      query.programmingLanguage = programmingLanguage;
    }

    return query;
  }
}
