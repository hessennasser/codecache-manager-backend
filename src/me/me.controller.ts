import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { SnippetsService } from "../snippets/snippets.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UpdateSnippetDto } from "src/snippets/dto/update-snippet.dto";
import { CreateSnippetDto } from "src/snippets/dto/create-snippet.dto";

@Controller("me")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly snippetsService: SnippetsService,
  ) {}

  @Get()
  async getProfile(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.findOne(userId);
  }

  @Get("snippets")
  async getMySnippets(@Request() req) {
    const userId = req.user.sub;
    return this.snippetsService.getSnippetsByUserId(userId);
  }

  @Post("snippet")
  async createSnippet(
    @Request() req,
    @Body() createSnippetDto: CreateSnippetDto,
  ) {
    const userId = req.user.sub;
    return this.snippetsService.createSnippet(userId, createSnippetDto);
  }

  @Put("snippet/:id")
  async updateSnippet(
    @Request() req,
    @Param("id") id: string,
    @Body() updateSnippetDto: UpdateSnippetDto,
  ) {
    const updatedSnippet = await this.snippetsService.updateSnippet(
      req.user.id,
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

  @Delete("snippet/:id")
  async deleteSnippet(@Request() req, @Param("id") id: string) {
    const deletedSnippet = await this.snippetsService.deleteSnippet(
      req.user.id,
      id,
    );
    if (!deletedSnippet) {
      throw new NotFoundException(
        "Snippet not found or you do not have permission to delete it",
      );
    }
    return { message: "Snippet deleted successfully" };
  }
}
