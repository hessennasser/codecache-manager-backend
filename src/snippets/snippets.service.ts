import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    if (!userId || !uuidValidate(userId)) {
      throw new BadRequestException("Invalid user ID");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const newSnippet = new this.snippetModel({
      ...createSnippetDto,
      userId: userId,
    });
    const savedSnippet = await newSnippet.save();

    // Update user's snippetIds in PostgreSQL
    const snippetIds = user.snippetIds
      ? [...user.snippetIds, savedSnippet.id.toString()]
      : [savedSnippet.id.toString()];

    try {
      await this.userRepository.update(userId, { snippetIds });
    } catch (error) {
      // If updating user fails, delete the saved snippet to maintain consistency
      await this.snippetModel.findByIdAndDelete(savedSnippet.id);
      throw new BadRequestException("Failed to update user with new snippet");
    }

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
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
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

    return { snippets, total, page, limit };
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
    if (!uuidValidate(userId)) {
      throw new BadRequestException("Invalid user ID");
    }
    const query: any = { userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (language) {
      query.language = language;
    }

    const total = await this.snippetModel.countDocuments({
      userId,
    });

    const snippets = await this.snippetModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { snippets, total, page, limit };
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
    if (!uuidValidate(userId)) {
      throw new BadRequestException("Invalid user ID");
    }

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
    if (!uuidValidate(userId)) {
      throw new BadRequestException("Invalid user ID");
    }

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

    // Update user's snippetIds in PostgreSQL
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      const updatedSnippetIds = user.snippetIds.filter(
        (snippetId) => snippetId !== id,
      );
      await this.userRepository.update(userId, {
        snippetIds: updatedSnippetIds,
      });
    }

    return deletedSnippet;
  }
}
