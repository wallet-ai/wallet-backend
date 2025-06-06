import { Expense } from '@entities/expense.entity';
import { User } from '@entities/user.entity';
import { CategoryService } from '@modules/categories/category.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dtos/create-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
    private readonly logger: Logger,
    private readonly categoryService: CategoryService,
  ) {}

  async create(dto: CreateExpenseDto, user: User) {
    try {
      const category = await this.categoryService.findById(dto.categoryId);
      return await this.repo.save({ ...dto, user, category });
    } catch (err) {
      this.logger.error('Erro ao salvar despesa', { error: err });

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Erro ao salvar despesa.');
    }
  }

  async findAllByUser(user: User) {
    try {
      return await this.repo.find({
        where: { user: { id: user.id } },
        relations: ['category'],
      });
    } catch (err) {
      this.logger.error('Erro ao buscar despesas', { error: err });
      throw new InternalServerErrorException('Erro ao buscar despesas.');
    }
  }

  async remove(id: number, user: User) {
    try {
      const expense = await this.repo.findOne({
        where: { id, user: { id: user.id } },
      });

      if (!expense) {
        throw new NotFoundException('Despesa não encontrada.');
      }

      return await this.repo.remove(expense);
    } catch (err) {
      this.logger.error('Erro ao remover despesa', { error: err });
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Erro ao remover despesa.');
    }
  }

  async getTotalByCategory(user: User) {
    try {
      const result = await this.repo
        .createQueryBuilder('expense')
        .leftJoin('expense.category', 'category')
        .select('category.name', 'category')
        .addSelect('SUM(expense.amount)', 'total')
        .where('expense.userId = :userId', { userId: user.id })
        .groupBy('category.name')
        .orderBy('total', 'DESC')
        .getRawMany();

      return result.map((row) => ({
        category: row.category,
        total: parseFloat(row.total),
      }));
    } catch (err) {
      this.logger.error('Erro ao agrupar despesas por categoria', {
        error: err,
      });
      throw new InternalServerErrorException('Erro ao agrupar despesas.');
    }
  }
}
