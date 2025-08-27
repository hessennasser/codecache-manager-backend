import {
  Body,
  Controller,
  Delete,
  Get,
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
import { User } from "../users/entities/user.entity";
import { Snippet } from "src/snippets/entities/snippet.entity";
import { PaginationDto } from "../snippets/dto/pagination.dto";
import { SnippetFiltersDto } from "../snippets/dto/snippet-filters.dto";

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
    const user = await this.usersService.findOne(userId);
    return { user };
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
  @ApiQuery({ name: "programmingLanguage", required: false, type: String })
  async getMySnippets(
    @Request() req,
    @Query() query: PaginationDto & SnippetFiltersDto,
  ) {
    const userId = req.user.sub;
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
    return this.snippetsService.getSnippetsByUserId(
      userId,
      paginationDto,
      filtersDto,
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
    console.log(createSnippetDto, "createSnippetDto");
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
    return this.snippetsService.updateSnippet(userId, id, updateSnippetDto);
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
    await this.snippetsService.deleteSnippet(userId, id);
    return { message: "Snippet deleted successfully" };
  }
}
