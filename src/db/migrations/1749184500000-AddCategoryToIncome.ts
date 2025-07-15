import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryToIncome1749184500000 implements MigrationInterface {
  name = 'AddCategoryToIncome1749184500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "income" 
      ADD COLUMN "categoryId" integer
    `);

    await queryRunner.query(`
      ALTER TABLE "income" 
      ADD CONSTRAINT "FK_income_category" 
      FOREIGN KEY ("categoryId") 
      REFERENCES "category"("id") 
      ON DELETE RESTRICT 
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "income" 
      DROP CONSTRAINT "FK_income_category"
    `);

    await queryRunner.query(`
      ALTER TABLE "income" 
      DROP COLUMN "categoryId"
    `);
  }
}
