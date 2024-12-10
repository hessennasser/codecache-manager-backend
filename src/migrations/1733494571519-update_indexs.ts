import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateIndexs1733494571519 implements MigrationInterface {
    name = 'UpdateIndexs1733494571519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_8f5b25dfd44896d9747f81c9df"`);
        await queryRunner.query(`CREATE INDEX "IDX_1a92e87b8e589f5b25e27294bb" ON "snippet" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1a92e87b8e589f5b25e27294bb"`);
        await queryRunner.query(`CREATE INDEX "IDX_8f5b25dfd44896d9747f81c9df" ON "snippet" ("title", "description", "content") `);
    }

}
