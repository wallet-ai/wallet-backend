import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultCategories1717630000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "category" ("name") VALUES 
        ('Aluguel'),
        ('Alimentação'),
        ('Lazer'),
        ('Transporte'),
        ('Educação'),
        ('Saúde'),
        ('Outros');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "category" 
      WHERE "name" IN ('Aluguel', 'Alimentação', 'Lazer', 'Transporte', 'Educação', 'Saúde', 'Outros');
    `);
  }
}
