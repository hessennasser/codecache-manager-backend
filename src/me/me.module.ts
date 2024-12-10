import { Module } from "@nestjs/common";
import { MeController } from "./me.controller";
import { UsersService } from "../users/users.service";
import { SnippetsService } from "../snippets/snippets.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtService } from "src/auth/strategies/jwt.strategy";
import { Snippet } from "src/snippets/entities/snippet.entity";
import { Tag } from "src/snippets/entities/tag.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Snippet, Tag])],
  controllers: [MeController],
  providers: [UsersService, SnippetsService, JwtService],
})
export class MeModule {}
