import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { SnippetsService } from "../snippets/snippets.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { UpdateSnippetDto } from "../snippets/dto/update-snippet.dto";
import { CreateSnippetDto } from "../snippets/dto/create-snippet.dto";
import { Snippet } from "../snippets/schemas/snippet.schema";
import { User } from "../users/entities/user.entity";

@ApiTags("me")
@Controller("me")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly snippetsService: SnippetsService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: 200,
    description: "Return the user profile",
    type: User,
  })
  async getProfile(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.findOne(userId);
  }

  @Get("snippets")
  @ApiOperation({ summary: "Get user's snippets" })
  @ApiResponse({
    status: 200,
    description: "Return user's snippets",
    type: [Snippet],
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "tags", required: false, type: [String], isArray: true })
  @ApiQuery({ name: "language", required: false, type: String })
  async getMySnippets(
    @Request() req,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string,
    @Query("tags") tags?: string[],
    @Query("language") language?: string,
  ) {
    const userId = req.user.sub;
    return this.snippetsService.getSnippetsByUserId(
      userId,
      page,
      limit,
      search,
      tags,
      language,
    );
  }

  @Post("snippets")
  @ApiOperation({ summary: "Create a new snippet" })
  @ApiResponse({
    status: 201,
    description: "The snippet has been successfully created",
    type: Snippet,
  })
  async createSnippet(
    @Request() req,
    @Body() createSnippetDto: CreateSnippetDto,
  ) {
    const userId = req.user.sub;
    return this.snippetsService.createSnippet(userId, createSnippetDto);
  }

  @Put("snippets/:id")
  @ApiOperation({ summary: "Update a snippet" })
  @ApiResponse({
    status: 200,
    description: "The snippet has been successfully updated",
    type: Snippet,
  })
  @ApiResponse({ status: 404, description: "Snippet not found" })
  async updateSnippet(
    @Request() req,
    @Param("id") id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
  ) {
    const userId = req.user.sub;
    const updatedSnippet = await this.snippetsService.updateSnippet(
      userId,
      id,
      updateSnippetDto,
    );
    if (!updatedSnippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to update it",
      );
    }
    return updatedSnippet;
  }

  @Delete("snippets/:id")
  @ApiOperation({ summary: "Delete a snippet" })
  @ApiResponse({
    status: 200,
    description: "The snippet has been successfully deleted",
  })
  @ApiResponse({ status: 404, description: "Snippet not found" })
  async deleteSnippet(@Request() req, @Param("id") id: string) {
    const userId = req.user.sub;
    const deletedSnippet = await this.snippetsService.deleteSnippet(userId, id);
    if (!deletedSnippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to delete it",
      );
    }
    return { message: "Snippet deleted successfully" };
  }

  @Patch("snippets/:id/save")
  @ApiOperation({ summary: "Add or remove a snippet from saved snippets" })
  @ApiResponse({
    status: 200,
    description: "Snippet has been successfully updated in saved snippets",
  })
  @ApiResponse({
    status: 404,
    description: "Snippet not found or you do not have permission",
  })
  async updateSavedSnippets(
    @Request() req,
    @Param("id") snippetId: string,
    @Query("action") action: "add" | "remove",
  ) {
    const userId = req.user.sub;
    const addSnippet = action === "add";

    await this.snippetsService.updateSavedSnippets(
      userId,
      snippetId,
      addSnippet,
    );

    return {
      message: `Snippet ${addSnippet ? "added to" : "removed from"} saved snippets successfully`,
    };
  }

  @Get("users/:userId/saved-snippets")
  @ApiOperation({ summary: "Get saved snippets for a user" })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved saved snippets",
  })
  @ApiResponse({ status: 404, description: "User not found" })
  async getSavedSnippets(
    @Param("userId") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string,
    @Query("tags") tags?: string[],
    @Query("language") language?: string,
  ) {
    const savedSnippets = await this.snippetsService.getSavedSnippets(
      userId,
      page,
      limit,
      search,
      tags,
      language,
    );
    return savedSnippets;
  }
}
