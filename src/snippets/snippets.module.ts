import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetsController } from "./snippets.controller";
import { SnippetsService } from "./snippets.service";
import { Snippet, SnippetSchema } from "./schemas/snippet.schema";
import { User } from "../users/entities/user.entity";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Snippet.name, schema: SnippetSchema }]),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
  ],
  controllers: [SnippetsController],
  providers: [SnippetsService],
  exports: [SnippetsService],
})
export class SnippetsModule {}
