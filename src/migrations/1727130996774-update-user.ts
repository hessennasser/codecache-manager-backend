import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUser1727130996774 implements MigrationInterface {
    name = 'UpdateUser1727130996774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "position" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "companyName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "companyWebsite" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "companyWebsite"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "companyName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "position"`);
    }

}
