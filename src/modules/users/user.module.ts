import { User } from '@entities/user.entity';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { UserController } from '@modules/users/user.controller';
import { UserService } from '@modules/users/user.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FirebaseModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
