import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  pluggyTransactionId: string;

  @Column()
  description: string;

  @Column('numeric')
  amount: number;

  @Column()
  date: Date;

  @Column()
  type: 'INCOME' | 'EXPENSE';

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  accountId?: string;

  @Column()
  itemId: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
