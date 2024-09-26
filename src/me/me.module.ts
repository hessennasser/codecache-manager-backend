import { Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { UsersService } from "../users/users.service";
import { SnippetsService } from "../snippets/snippets.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { Snippet, SnippetSchema } from "../snippets/schemas/snippet.schema";
import { JwtService } from "src/auth/strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MongooseModule.forFeature([{ name: Snippet.name, schema: SnippetSchema }]),
  ],
  controllers: [MeController],
  providers: [UsersService, SnippetsService, JwtService],
})
export class MeModule {}
