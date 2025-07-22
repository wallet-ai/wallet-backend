import { Transaction } from '@entities/transaction.entity';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { PluggyTransactionController } from '@modules/pluggy/pluggy-transactions/pluggy-transaction.controller';
import { PluggyTransactionService } from '@modules/pluggy/pluggy-transactions/pluggy-transaction.service';
import { UserModule } from '@modules/users/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    FirebaseModule,
    UserModule,
  ],
  controllers: [PluggyTransactionController],
  providers: [PluggyTransactionService],
})
export class PluggyTransactionModule {}
