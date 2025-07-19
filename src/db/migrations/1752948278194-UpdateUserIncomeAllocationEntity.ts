import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserIncomeAllocationEntity1752948278194 implements MigrationInterface {
    name = 'UpdateUserIncomeAllocationEntity1752948278194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "income" DROP CONSTRAINT "FK_income_user"`);
        await queryRunner.query(`ALTER TABLE "income" DROP CONSTRAINT "FK_income_category"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP CONSTRAINT "FK_allocation_user"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_expense_user"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_expense_category"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "fixedSalary" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "extraIncome" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "totalMonthlyIncome" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "investmentsAmount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "expensesAmount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "leisureAmount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ALTER COLUMN "investmentsPercentage" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ALTER COLUMN "expensesPercentage" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ALTER COLUMN "leisurePercentage" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "income" ADD CONSTRAINT "FK_0965fe0d5faa3b2e7518d7bb244" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "income" ADD CONSTRAINT "FK_977569f13a51a1ec583765daffd" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD CONSTRAINT "FK_161b56dc169c418d05b79074c9e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_06e076479515578ab1933ab4375" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_42eea5debc63f4d1bf89881c10a" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_42eea5debc63f4d1bf89881c10a"`);
        await queryRunner.query(`ALTER TABLE "expense" DROP CONSTRAINT "FK_06e076479515578ab1933ab4375"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP CONSTRAINT "FK_161b56dc169c418d05b79074c9e"`);
        await queryRunner.query(`ALTER TABLE "income" DROP CONSTRAINT "FK_977569f13a51a1ec583765daffd"`);
        await queryRunner.query(`ALTER TABLE "income" DROP CONSTRAINT "FK_0965fe0d5faa3b2e7518d7bb244"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ALTER COLUMN "leisurePercentage" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ALTER COLUMN "expensesPercentage" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ALTER COLUMN "investmentsPercentage" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "leisureAmount"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "expensesAmount"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "investmentsAmount"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "totalMonthlyIncome"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "extraIncome"`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" DROP COLUMN "fixedSalary"`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_expense_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expense" ADD CONSTRAINT "FK_expense_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_income_allocation" ADD CONSTRAINT "FK_allocation_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "income" ADD CONSTRAINT "FK_income_category" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "income" ADD CONSTRAINT "FK_income_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
