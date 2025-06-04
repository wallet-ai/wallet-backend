import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column('decimal')
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;

  @ManyToOne(() => Category, (category) => category.expenses)
  category: Category;
}
