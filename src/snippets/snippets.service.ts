import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Snippet } from "./schemas/snippet.schema";
import { User } from "../users/entities/user.entity";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { UpdateSnippetDto } from "./dto/update-snippet.dto";
import { validate as uuidValidate } from "uuid";

@Injectable()
export class SnippetsService {
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

    return savedSnippet;
  }

  async getAllSnippets(
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
    const query = this.buildSnippetQuery(search, tags, language);
    return this.paginateSnippets(query, page, limit, search);
  }

  async getSnippetsByUserId(
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
    this.validateUserId(userId);
    const query = this.buildSnippetQuery(search, tags, language, userId);
    return this.paginateSnippets(query, page, limit, search);
  }

  async getSnippetById(id: string): Promise<Snippet> {
    const snippet = await this.snippetModel.findById(id).exec();
    if (!snippet) {
      throw new NotFoundException("Snippet not found");
    }
    return snippet;
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

    return updatedSnippet;
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

    return deletedSnippet;
  }

  async incrementSnippetViews(id: string): Promise<Snippet> {
    const updatedSnippet = await this.snippetModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .exec();

    if (!updatedSnippet) {
      throw new NotFoundException("Snippet not found");
    }

    return updatedSnippet;
  }

  async getPopularSnippets(limit: number = 10): Promise<Snippet[]> {
    return this.snippetModel
      .find({ isPublic: true })
      .sort({ viewCount: -1 })
      .limit(limit)
      .exec();
  }

  async getRecentSnippets(limit: number = 10): Promise<Snippet[]> {
    return this.snippetModel
      .find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
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
    tags?: string[],
    language?: string,
    userId?: string,
  ): any {
    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (language) {
      query.language = language;
    }

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
    page: number;
    limit: number;
  }> {
    const total = await this.snippetModel.countDocuments(query);
    let snippetQuery = this.snippetModel.find(query);

    if (search) {
      snippetQuery = snippetQuery.sort({ score: { $meta: "textScore" } });
    }

    const snippets = await snippetQuery
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { snippets, total, page, limit };
  }
}
