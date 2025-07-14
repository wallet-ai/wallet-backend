import { Category } from '@entities/category.entity';
import { CategoryController } from '@modules/categories/category.controller';
import { CategoryService } from '@modules/categories/category.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
