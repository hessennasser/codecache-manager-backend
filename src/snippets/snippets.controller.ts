import {
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common";
import { SnippetsService } from "./snippets.service";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";

@ApiTags("snippets")
@Controller("snippets")
@ApiBearerAuth()
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Get()
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

  @Get(":id")
  async getSnippetById(@Param("id") id: string) {
    return this.snippetsService.getSnippetById(id);
  }
}
