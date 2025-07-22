import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluggyItem } from '../../entities/pluggy-item.entity';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../users/user.module';
import { PluggyItemController } from './pluggy-item.controller';
import { PluggyItemService } from './pluggy-item.service';
import { PluggyController } from './pluggy.controller';
import { PluggyService } from './pluggy.service';

@Module({
  imports: [TypeOrmModule.forFeature([PluggyItem]), FirebaseModule, UserModule],
  controllers: [PluggyController, PluggyItemController],
  providers: [PluggyService, PluggyItemService],
  exports: [PluggyService, PluggyItemService],
})
export class PluggyModule {}
