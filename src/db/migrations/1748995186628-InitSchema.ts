import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1748995186628 implements MigrationInterface {
  name = 'InitSchema1748995186628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "income" (
                "id" SERIAL NOT NULL,
                "description" character varying NOT NULL,
                "amount" numeric NOT NULL,
                "startDate" date NOT NULL,
                "endDate" date,
                "userId" integer,
                CONSTRAINT "PK_3c7d78e8cf6c15bc5c6f9b87a43" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "user_income_allocation" (
                "id" SERIAL NOT NULL,
                "expensesPercentage" numeric NOT NULL,
                "leisurePercentage" numeric NOT NULL,
                "investmentsPercentage" numeric NOT NULL,
                "userId" integer,
                CONSTRAINT "PK_76dec14d95ded1e276395e7f317" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "firebase_uuid" character varying NOT NULL,
                "name" character varying(50) NOT NULL,
                "email" character varying(50) NOT NULL,
                CONSTRAINT "UQ_3308ac87fc24fc559cd6951c916" UNIQUE ("firebase_uuid"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "expense" (
                "id" SERIAL NOT NULL,
                "description" character varying NOT NULL,
                "amount" numeric NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "userId" integer,
                "categoryId" integer,
                CONSTRAINT "PK_edd925b450e13ea36197c9590fc" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "type" character varying NOT NULL,
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
            )
        `);

    // Relacionamentos (foreign keys)
    await queryRunner.query(`
            ALTER TABLE "income"
            ADD CONSTRAINT "FK_income_user"
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "user_income_allocation"
            ADD CONSTRAINT "FK_allocation_user"
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "FK_expense_user"
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "expense"
            ADD CONSTRAINT "FK_expense_category"
            FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_expense_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_expense_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_income_allocation" DROP CONSTRAINT "FK_allocation_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "income" DROP CONSTRAINT "FK_income_user"`,
    );

    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "expense"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_income_allocation"`);
    await queryRunner.query(`DROP TABLE "income"`);
  }
}
