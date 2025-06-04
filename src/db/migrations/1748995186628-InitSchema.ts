import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1748995186628 implements MigrationInterface {
    name = 'InitSchema1748995186628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "monthly_income" ("id" SERIAL NOT NULL, "referenceMonth" character varying NOT NULL, "amount" numeric NOT NULL, "userId" integer, CONSTRAINT "PK_e030371b648b334c9379cf75342" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recurring_income" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "amount" numeric NOT NULL, "userId" integer, CONSTRAINT "PK_a61fffba1c4e85548b7fe42314a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_income_allocation" ("id" SERIAL NOT NULL, "expensesPercentage" numeric NOT NULL, "leisurePercentage" numeric NOT NULL, "investmentsPercentage" numeric NOT NULL, "userId" integer, CONSTRAINT "PK_76dec14d95ded1e276395e7f317" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firebase_uuid" character varying NOT NULL, "name" character varying(50) NOT NULL, "email" character varying(50) NOT NULL, CONSTRAINT "UQ_3308ac87fc24fc559cd6951c916" UNIQUE ("firebase_uuid"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "expense" ("id" SERIAL NOT NULL, "description" character varying NOT NULL, "amount" numeric NOT NULL, "date" TIMESTAMP NOT NULL, "userId" integer, "categoryId" integer, CONSTRAINT "PK_edd925b450e13ea36197c9590fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "monthly_income" ADD CONSTRAINT "FK_91d9c10bdbea3bdcc8174275f27" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurring_income" ADD CONSTRAINT "FK_c3984895184efaed4aa1a15833d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD CONSTRAINT "FK_161b56dc169c418d05b79074c9e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_06e076479515578ab1933ab4375" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_42eea5debc63f4d1bf89881c10a" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_42eea5debc63f4d1bf89881c10a"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_06e076479515578ab1933ab4375"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP CONSTRAINT "FK_161b56dc169c418d05b79074c9e"`);
        await queryRunner.query(`ALTER TABLE "recurring_income" DROP CONSTRAINT "FK_c3984895184efaed4aa1a15833d"`);
        await queryRunner.query(`ALTER TABLE "monthly_income" DROP CONSTRAINT "FK_91d9c10bdbea3bdcc8174275f27"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "expense"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "user_income_allocation"`);
        await queryRunner.query(`DROP TABLE "recurring_income"`);
        await queryRunner.query(`DROP TABLE "monthly_income"`);
    }

}
