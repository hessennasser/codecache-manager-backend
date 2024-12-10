import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetsController } from "./snippets.controller";
import { SnippetsService } from "./snippets.service";
import { User } from "../users/entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { Snippet } from "./entities/snippet.entity";
import { Tag } from "./entities/tag.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Snippet, Tag]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SnippetsController],
  providers: [SnippetsService],
  exports: [
    SnippetsService,
  ],
})
export class SnippetsModule {}
