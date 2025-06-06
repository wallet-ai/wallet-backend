import { Expense } from '@entities/expense.entity';
import { CategoryModule } from '@modules/categories/category.module';
import { ExpenseService } from '@modules/expenses/expense.service';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { UserModule } from '@modules/users/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseController } from 'modules/expenses/expense.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    UserModule,
    FirebaseModule,
    CategoryModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
