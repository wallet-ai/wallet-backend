import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserIncomeAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  expensesPercentage: number;

  @Column('decimal')
  leisurePercentage: number;

  @Column('decimal')
  investmentsPercentage: number;

  @ManyToOne(() => User, (user) => user.incomeAllocations)
  user: User;
}
