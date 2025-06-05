import { User } from '@entities/user.entity';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RecurringIncome {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column('decimal')
  @Type(() => Number)
  amount: number;

  @ManyToOne(() => User, (user) => user.recurringIncomes)
  user: User;
}
