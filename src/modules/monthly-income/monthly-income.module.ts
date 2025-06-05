import { MonthlyIncome } from '@entities/monthly-income.entity';
import { FirebaseModule } from '@firebase/firebase.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@users/user.module';
import { MonthlyIncomeController } from 'modules/monthly-income/monthly-income.controller';
import { MonthlyIncomeService } from 'modules/monthly-income/monthly-incomme.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonthlyIncome]),
    UserModule,
    FirebaseModule,
  ],
  controllers: [MonthlyIncomeController],
  providers: [MonthlyIncomeService],
})
export class MonthlyIncomeModule {}
