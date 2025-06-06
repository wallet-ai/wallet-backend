import { Income } from '@entities/income.entity';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { IncomeService } from '@modules/income/income.service';
import { UserModule } from '@modules/users/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeController } from 'modules/income/income.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Income]), UserModule, FirebaseModule],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
