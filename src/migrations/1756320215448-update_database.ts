import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDatabase1756320215448 implements MigrationInterface {
    name = 'UpdateDatabase1756320215448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "usageCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "snippet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" character varying(500), "content" text NOT NULL, "programmingLanguage" character varying NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_70387b18f1ab2e9cdd22a710fcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7e403124fbb6c615033d9a9837" ON "snippet" ("programmingLanguage") `);
        await queryRunner.query(`CREATE INDEX "IDX_da314b917a063a91ffbc59b28e" ON "snippet" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1a92e87b8e589f5b25e27294bb" ON "snippet" ("title") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(50) NOT NULL, "lastName" character varying(50) NOT NULL, "email" character varying(100) NOT NULL, "position" character varying(100), "companyName" character varying(100), "companyWebsite" character varying(100), "username" character varying(30) NOT NULL, "password" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "snippet_tags_tag" ("snippetId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_97751f7370bef8e27d66621ecec" PRIMARY KEY ("snippetId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4cc351c82a0b98e06b256b8576" ON "snippet_tags_tag" ("snippetId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e1456d333910cebbd3b36195c" ON "snippet_tags_tag" ("tagId") `);
        await queryRunner.query(`ALTER TABLE "snippet" ADD CONSTRAINT "FK_da314b917a063a91ffbc59b28e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" ADD CONSTRAINT "FK_4cc351c82a0b98e06b256b8576e" FOREIGN KEY ("snippetId") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" ADD CONSTRAINT "FK_3e1456d333910cebbd3b36195c9" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" DROP CONSTRAINT "FK_3e1456d333910cebbd3b36195c9"`);
        await queryRunner.query(`ALTER TABLE "snippet_tags_tag" DROP CONSTRAINT "FK_4cc351c82a0b98e06b256b8576e"`);
        await queryRunner.query(`ALTER TABLE "snippet" DROP CONSTRAINT "FK_da314b917a063a91ffbc59b28e6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e1456d333910cebbd3b36195c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4cc351c82a0b98e06b256b8576"`);
        await queryRunner.query(`DROP TABLE "snippet_tags_tag"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a92e87b8e589f5b25e27294bb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da314b917a063a91ffbc59b28e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7e403124fbb6c615033d9a9837"`);
        await queryRunner.query(`DROP TABLE "snippet"`);
        await queryRunner.query(`DROP TABLE "tag"`);
    }

}
