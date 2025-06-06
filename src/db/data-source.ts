// src/db/data-source.ts
import { Income } from '@entities/income.entity';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { UserIncomeAllocation } from '../entities/user-income-allocation.entity';
import { User } from '../entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Expense, Category, Income, UserIncomeAllocation],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
});
