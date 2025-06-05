import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@entities/category.entity';
import { Expense } from '@entities/expense.entity';
import { MonthlyIncome } from '@entities/monthly-income.entity';
import { RecurringIncome } from '@entities/recurring-income.entity';
import { UserIncomeAllocation } from '@entities/user-income-allocation.entity';
import { User } from '@entities/user.entity';
import { FirebaseModule } from '@firebase/firebase.module';
import { UserModule } from '@users/user.module';
import { MonthlyIncomeModule } from 'modules/monthly-income/monthly-income.module';
import { RecurringIncomeModule } from 'modules/recurring-income/recurring-income.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          User,
          Expense,
          Category,
          RecurringIncome,
          MonthlyIncome,
          UserIncomeAllocation,
        ],
        synchronize: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    FirebaseModule,
    UserModule,
    MonthlyIncomeModule,
    RecurringIncomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
