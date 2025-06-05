import { User } from '@entities/user.entity';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MonthlyIncome {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  referenceMonth: string; // Ex: '2025-06'

  @Column('decimal')
  @Type(() => Number)
  amount: number;

  @ManyToOne(() => User, (user) => user.monthlyIncomes)
  user: User;
}
