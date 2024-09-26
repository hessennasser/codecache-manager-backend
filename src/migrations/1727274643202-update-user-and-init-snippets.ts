import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAndInitSnippets1727274643202 implements MigrationInterface {
    name = 'UpdateUserAndInitSnippets1727274643202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "snippetIds" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "snippetIds"`);
    }

}
