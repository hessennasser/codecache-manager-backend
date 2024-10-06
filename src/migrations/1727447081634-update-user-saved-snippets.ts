import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSavedSnippets1727447081634 implements MigrationInterface {
    name = 'UpdateUserSavedSnippets1727447081634'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "savedSnippetIds" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "savedSnippetIds"`);
    }

}
