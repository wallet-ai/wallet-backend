import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultCategories1749177026503 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "category" ("name", "type") VALUES 
        ('Aluguel', 'expense'),
        ('Alimentação', 'expense'),
        ('Lazer', 'expense'),
        ('Transporte', 'expense'),
        ('Educação', 'expense'),
        ('Saúde', 'expense'),
        ('Outros Gastos', 'expense'),
        ('Salário', 'income'),
        ('Investimentos', 'income'),
        ('Freelance', 'income'),
        ('Bonus', 'income'),
        ('Outras Receitas', 'income')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "category" 
      WHERE "name" IN (
        'Aluguel', 'Alimentação', 'Lazer', 'Transporte', 
        'Educação', 'Saúde', 'Outros Gastos', 'Salário', 
        'Investimentos', 'Freelance', 'Bonus', 'Outras Receitas'
      )
    `);
  }
}
