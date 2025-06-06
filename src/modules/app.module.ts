import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '@entities/category.entity';
import { Expense } from '@entities/expense.entity';
import { Income } from '@entities/income.entity';
import { UserIncomeAllocation } from '@entities/user-income-allocation.entity';
import { User } from '@entities/user.entity';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { UserModule } from '@modules/users/user.module';
import { IncomeModule } from 'modules/income/income.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            transport:
              process.env.NODE_ENV !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      translateTime: 'HH:MM:ss',
                      ignore: 'pid,hostname',
                    },
                  }
                : undefined,
          },
        }),
        ConfigModule,
      ],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User, Expense, Category, Income, UserIncomeAllocation],
        synchronize: false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    FirebaseModule,
    UserModule,
    IncomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
