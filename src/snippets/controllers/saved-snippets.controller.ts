import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SavedSnippetsService } from '../services/saved-snippets.service';
import { User } from '../../users/entities/user.entity';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('saved-snippets')
@UseGuards(JwtAuthGuard)
export class SavedSnippetsController {
  constructor(private readonly savedSnippetsService: SavedSnippetsService) {}

  @Post(':snippetId')
  async saveSnippet(
    @GetUser() user: User,
    @Param('snippetId') snippetId: string,
  ) {
    return this.savedSnippetsService.saveSnippet(user.id, snippetId);
  }

  @Delete(':snippetId')
  async unsaveSnippet(
    @GetUser() user: User,
    @Param('snippetId') snippetId: string,
  ) {
    return this.savedSnippetsService.unsaveSnippet(user.id, snippetId);
  }

  @Get()
  async getSavedSnippets(
    @GetUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.savedSnippetsService.getUserSavedSnippets(user.id, +page, +limit);
  }

  @Get(':snippetId/is-saved')
  async isSnippetSaved(
    @GetUser() user: User,
    @Param('snippetId') snippetId: string,
  ) {
    return {
      isSaved: await this.savedSnippetsService.isSnippetSaved(user.id, snippetId),
    };
  }
}
