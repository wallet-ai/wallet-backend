import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersController } from './users.controller';

@Module({
  imports: [FirebaseModule],
  controllers: [UsersController],
  providers: [],
})
export class UsersModule {}
