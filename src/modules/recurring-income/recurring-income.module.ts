import { RecurringIncome } from '@entities/recurring-income.entity';
import { FirebaseModule } from '@firebase/firebase.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@users/user.module';
import { RecurringIncomeController } from 'modules/recurring-income/recurring-income.controller';
import { RecurringIncomeService } from 'modules/recurring-income/recurring-incomme.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringIncome]),
    UserModule,
    FirebaseModule,
  ],
  controllers: [RecurringIncomeController],
  providers: [RecurringIncomeService],
})
export class RecurringIncomeModule {}
