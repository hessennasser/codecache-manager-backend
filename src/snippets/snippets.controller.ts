import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Request,
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
import { Snippet } from "./entities/snippet.entity";
import { PaginationDto } from "./dto/pagination.dto";
import { SnippetFiltersDto } from "./dto/snippet-filters.dto";

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
  @ApiQuery({ name: "programmingLanguage", required: false, type: String })
  async getAllSnippets(@Query() query: PaginationDto & SnippetFiltersDto) {
    const paginationDto: PaginationDto = {
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
    };

    const filtersDto: SnippetFiltersDto = {
      search: query.search,
      tags: Array.isArray(query.tags)
        ? query.tags
        : query.tags
          ? [query.tags]
          : undefined,
      programmingLanguage: query.programmingLanguage,
    };

    return this.snippetsService.getAllSnippets(paginationDto, filtersDto);
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular snippets" })
  @ApiResponse({
    status: 200,
    description: "Return popular snippets",
    type: [Snippet],
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getPopularSnippets(@Query("limit") limit: string = "10") {
    return this.snippetsService.getPopularSnippets(Number(limit));
  }

  @Get("recent")
  @ApiOperation({ summary: "Get recent snippets" })
  @ApiResponse({
    status: 200,
    description: "Return recent snippets",
    type: [Snippet],
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getRecentSnippets(@Query("limit") limit: string = "10") {
    return this.snippetsService.getRecentSnippets(Number(limit));
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
}
