import { registerAs } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env" });

const config = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ["dist/**/*.entity.js"],
  autoLoadEntities: true,
  synchronize: false,
  migrations: [__dirname + "/../migrations/*.{ts,js}"],
  migrationsTableName: "typeorm_migrations",
  migrationsRun: false,
};

export default registerAs("typeorm", () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
