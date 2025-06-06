import { Expense } from '@entities/expense.entity';
import { Income } from '@entities/income.entity';
import { UserIncomeAllocation } from '@entities/user-income-allocation.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  firebase_uuid: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50 })
  email: string;

  @OneToMany(() => Income, (i) => i.user)
  incomes: Income[];

  @OneToMany(() => UserIncomeAllocation, (uia) => uia.user)
  incomeAllocations: UserIncomeAllocation[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];
}
