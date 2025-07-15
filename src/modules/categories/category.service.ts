import { Category } from '@entities/category.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { CategoryTypeEnum } from 'types/enums/category-type.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly logger: Logger,
  ) {}

  async findAll(type?: CategoryTypeEnum) {
    try {
      const whereCondition = type ? { type } : {};
      return await this.repo.find({
        where: whereCondition,
        order: { name: 'ASC' },
      });
    } catch (err) {
      this.logger.error('Erro ao buscar categorias', { error: err });
      throw new InternalServerErrorException('Erro ao buscar categorias.');
    }
  }

  async findById(categoryId: number): Promise<Category> {
    try {
      const category = await this.repo.findOne({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }

      return category;
    } catch (err) {
      this.logger.error('Erro ao buscar categoria', { error: err });

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Erro ao buscar categoria.');
    }
  }
}
