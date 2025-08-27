import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SnippetsModule } from "./snippets/snippets.module";
import { MeModule } from "./me/me.module";
import typeormConfig from "./config/typeorm";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("typeorm"),
      inject: [ConfigService],
    }),
    MulterModule.register({
      dest: "./uploads",
    }),
    UsersModule,
    AuthModule,
    SnippetsModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
