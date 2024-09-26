import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { SnippetsService } from "./snippets.service";
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Snippet } from "./schemas/snippet.schema";

@ApiTags("snippets")
@Controller("snippets")
@ApiBearerAuth()
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Get()
  @ApiOperation({ summary: "Get all snippets" })
  @ApiResponse({
    status: 200,
    description: "Return all snippets",
    type: [Snippet],
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "tags", required: false, type: [String], isArray: true })
  @ApiQuery({ name: "language", required: false, type: String })
  async getAllSnippets(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search?: string,
    @Query("tags") tags?: string[],
    @Query("language") language?: string,
  ) {
    return this.snippetsService.getAllSnippets(
      page,
      limit,
      search,
      tags,
      language,
    );
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular snippets" })
  @ApiResponse({
    status: 200,
    description: "Return popular snippets",
    type: [Snippet],
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getPopularSnippets(@Query("limit") limit: number = 10) {
    return this.snippetsService.getPopularSnippets(limit);
  }

  @Get("recent")
  @ApiOperation({ summary: "Get recent snippets" })
  @ApiResponse({
    status: 200,
    description: "Return recent snippets",
    type: [Snippet],
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getRecentSnippets(@Query("limit") limit: number = 10) {
    return this.snippetsService.getRecentSnippets(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a snippet by ID" })
  @ApiResponse({
    status: 200,
    description: "Return the snippet",
    type: Snippet,
  })
  @ApiResponse({ status: 404, description: "Snippet not found" })
  async getSnippetById(@Param("id") id: string) {
    const snippet = await this.snippetsService.getSnippetById(id);
    if (!snippet) {
      throw new NotFoundException("Snippet not found");
    }
    return snippet;
  }

  @Get(":id/view")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Increment snippet view count" })
  @ApiResponse({
    status: 200,
    description: "Return the updated snippet",
    type: Snippet,
  })
  @ApiResponse({ status: 404, description: "Snippet not found" })
  async incrementSnippetViews(@Param("id") id: string) {
    return this.snippetsService.incrementSnippetViews(id);
  }
}
