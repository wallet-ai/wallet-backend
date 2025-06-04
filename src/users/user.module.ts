import { User } from '@entities/user.entity';
import { FirebaseModule } from '@firebase/firebase.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@users/user.controller';
import { UserService } from '@users/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FirebaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
