import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryTypeEnum } from '../types/enums/category-type.enum';
import { Expense } from './expense.entity';
import { Income } from './income.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: CategoryTypeEnum;

  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];

  @OneToMany(() => Income, (income) => income.category)
  incomes: Income[];
}
