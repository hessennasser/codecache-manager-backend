import { MigrationInterface, QueryRunner } from "typeorm";

export class CompleteMigration1733494319015 implements MigrationInterface {
    name = 'CompleteMigration1733494319015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "saved_snippet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "savedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "snippetId" uuid, CONSTRAINT "PK_792d317165742d92a85a57ca144" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "saved_snippet" ADD CONSTRAINT "FK_8855d5c8345e89fd0835d938ad9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_snippet" ADD CONSTRAINT "FK_a504936241cb54ea867c3daf317" FOREIGN KEY ("snippetId") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_snippet" DROP CONSTRAINT "FK_a504936241cb54ea867c3daf317"`);
        await queryRunner.query(`ALTER TABLE "saved_snippet" DROP CONSTRAINT "FK_8855d5c8345e89fd0835d938ad9"`);
        await queryRunner.query(`DROP TABLE "saved_snippet"`);
    }

}
