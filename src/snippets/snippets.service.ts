import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Snippet } from "./schemas/snippet.schema";
import { User } from "../users/entities/user.entity";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { UpdateSnippetDto } from "./dto/update-snippet.dto";
import { validate as uuidValidate } from "uuid";
import { Document } from "mongoose";

@Injectable()
export class SnippetsService {
  private readonly logger = new Logger(SnippetsService.name);
  constructor(
    @InjectModel(Snippet.name) private snippetModel: Model<Snippet>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createSnippet(
    userId: string,
    createSnippetDto: CreateSnippetDto,
  ): Promise<Snippet> {
    this.validateUserId(userId);

    const user = await this.findUserById(userId);

    const newSnippet = new this.snippetModel({
      ...createSnippetDto,
      userId: userId,
    });
    const savedSnippet = await newSnippet.save();

    await this.updateUserSnippetList(user, savedSnippet.id.toString(), "add");

    return this.attachUserToSnippet(savedSnippet, user);
  }

  async getAllSnippets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    tags?: string[],
    language?: string,
  ): Promise<{
    snippets: Snippet[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    this.logger.debug(
      `getAllSnippets called with page=${page}, limit=${limit}, search=${search}, tags=${tags}, language=${language}`,
    );

    const query = this.buildSnippetQuery(search, tags, language);
    this.logger.debug(`Built query: ${JSON.stringify(query)}`);

    try {
      const { snippets, pagination } = await this.paginateSnippets(
        query,
        page,
        limit,
        search,
      );
      this.logger.debug(`Pagination result: ${JSON.stringify(pagination)}`);
      this.logger.debug(`Number of snippets found: ${snippets.length}`);

      if (snippets.length === 0) {
        this.logger.warn("No snippets found matching the query");
      }

      const snippetsWithUser = await this.attachUsersToSnippets(snippets);
      this.logger.debug(
        `Number of snippets with user attached: ${snippetsWithUser.length}`,
      );

      return { snippets: snippetsWithUser, pagination };
    } catch (error) {
      this.logger.error(
        `Error in getAllSnippets: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getSnippetsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    tags?: string[],
    language?: string,
  ): Promise<{
    data: {
      snippets: Snippet[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    this.validateUserId(userId);
    const query = this.buildSnippetQuery(search, tags, language, userId);
    const { snippets, pagination } = await this.paginateSnippets(
      query,
      page,
      limit,
      search,
    );
    const user = await this.findUserById(userId);
    const snippetsWithUser = snippets.map((snippet) =>
      this.attachUserToSnippet(snippet, user),
    );

    return {
      data: {
        snippets: snippetsWithUser,
        pagination,
      },
    };
  }

  async getSnippetById(id: string): Promise<Snippet> {
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet) {
      throw new NotFoundException("Snippet not found");
    }
    await this.incrementSnippetViews(snippet.id);
    const user = await this.findUserById(snippet.userId);
    return this.attachUserToSnippet(snippet, user);
  }

  async updateSnippet(
    userId: string,
    id: string,
    updateSnippetDto: UpdateSnippetDto,
  ): Promise<Snippet> {
    this.validateUserId(userId);

    const updatedSnippet = await this.snippetModel
      .findOneAndUpdate(
        { _id: id, userId: userId },
        { $set: updateSnippetDto },
        { new: true },
      )
      .exec();

    if (!updatedSnippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to update it",
      );
    }

    const user = await this.findUserById(userId);
    return this.attachUserToSnippet(updatedSnippet, user);
  }

  async deleteSnippet(userId: string, id: string): Promise<Snippet> {
    this.validateUserId(userId);

    const deletedSnippet = await this.snippetModel
      .findOneAndDelete({
        _id: id,
        userId: userId,
      })
      .exec();

    if (!deletedSnippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to delete it",
      );
    }

    const user = await this.findUserById(userId);
    await this.updateUserSnippetList(user, id, "remove");

    return this.attachUserToSnippet(deletedSnippet, user);
  }

  async getPopularSnippets(limit: number = 10): Promise<Snippet[]> {
    const snippets = await this.snippetModel
      .find({ isPublic: true })
      .sort({ viewCount: -1 })
      .limit(limit)
      .exec();
    return this.attachUsersToSnippets(snippets);
  }

  async getRecentSnippets(limit: number = 10): Promise<Snippet[]> {
    const snippets = await this.snippetModel
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return this.attachUsersToSnippets(snippets);
  }

  async updateSavedSnippets(
    userId: string,
    snippetId: string,
    add: boolean,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (add) {
      if (!user.savedSnippetIds.includes(snippetId)) {
        user.savedSnippetIds = [...user.savedSnippetIds, snippetId];
      }
    } else {
      user.savedSnippetIds = user.savedSnippetIds.filter(
        (id) => id !== snippetId,
      );
    }

    await this.userRepository.save(user);
  }

  async getSavedSnippets(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    tags?: string[],
    language?: string,
  ): Promise<{
    snippets: Snippet[];
    total: number;
    page: number;
    limit: number;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const query: any = {
      _id: { $in: user.savedSnippetIds },
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (language) {
      query.language = language;
    }

    const total = await this.snippetModel.countDocuments(query);
    const snippets = await this.snippetModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const snippetsWithUser = await this.attachUsersToSnippets(snippets);

    return { snippets: snippetsWithUser, total, page, limit };
  }

  private async incrementSnippetViews(id: string): Promise<Snippet> {
    const updatedSnippet = await this.snippetModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .exec();

    if (!updatedSnippet) {
      throw new NotFoundException("Snippet not found");
    }

    return updatedSnippet;
  }

  private validateUserId(userId: string): void {
    if (!userId || !uuidValidate(userId)) {
      throw new BadRequestException("Invalid user ID");
    }
  }

  private async findUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  private async updateUserSnippetList(
    user: User,
    snippetId: string,
    operation: "add" | "remove",
  ): Promise<void> {
    const snippetIds = user.snippetIds || [];

    if (operation === "add") {
      snippetIds.push(snippetId);
    } else {
      const index = snippetIds.indexOf(snippetId);
      if (index > -1) {
        snippetIds.splice(index, 1);
      }
    }

    try {
      await this.userRepository.update(user.id, { snippetIds });
    } catch (error) {
      if (operation === "add") {
        await this.snippetModel.findByIdAndDelete(snippetId);
      }
      throw new ConflictException("Failed to update user's snippet list");
    }
  }

  private buildSnippetQuery(
    search?: string,
    tags?: string | string[],
    language?: string,
    userId?: string,
  ): any {
    const query: any = {};

    if (userId) {
      query.userId = userId;
    } else {
      query.isPublic = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tags) {
      if (typeof tags === "string") {
        tags = tags.split(",").map((tag) => tag.trim());
      }
      if (Array.isArray(tags) && tags.length > 0) {
        query.tags = { $in: tags };
      }
    }

    if (language && language !== "all") {
      query.language = language;
    }

    this.logger.debug(`Built query: ${JSON.stringify(query)}`);
    return query;
  }

  private async paginateSnippets(
    query: any,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    snippets: Snippet[];
    total: number;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const total = await this.snippetModel.countDocuments(query);
    let snippetQuery = this.snippetModel.find(query);

    if (search) {
      snippetQuery = snippetQuery.sort({ score: { $meta: "textScore" } });
    }
    //

    const snippets = await snippetQuery
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      snippets,
      total,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
  private async attachUsersToSnippets(snippets: Snippet[]): Promise<Snippet[]> {
    const userIds = [...new Set(snippets.map((s) => s.userId))];
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });
    return snippets.map((snippet) => {
      const user = users.find((u) => u.id === snippet.userId);
      return this.attachUserToSnippet(snippet, user);
    });
  }

  private attachUserToSnippet(
    snippet: Snippet & Document,
    user: User,
  ): Snippet {
    return {
      ...snippet.toObject(),
      user: {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
