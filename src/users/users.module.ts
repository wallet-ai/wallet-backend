import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [UsersController],
  providers: [],
})
export class UsersModule {}
