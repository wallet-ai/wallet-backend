import { Category } from '@entities/category.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly logger: Logger,
  ) {}

  async findAll() {
    try {
      return await this.repo.find();
    } catch (err) {
      this.logger.error('Erro ao buscar categorias', { error: err });
      throw new InternalServerErrorException('Erro ao buscar rendas.');
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
