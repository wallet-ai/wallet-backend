import { DateFilterDto } from '@common/dtos/date-filter.dto';
import { Expense } from '@entities/expense.entity';
import { Transaction } from '@entities/transaction.entity';
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
import { UpdateExpenseDto } from './dtos/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly repo: Repository<Expense>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
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

  async findAllByUser(user: User, filters?: DateFilterDto) {
    try {
      // Busca por transações reais do Pluggy
      const txQuery = this.transactionRepo
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId', { userId: user.id })
        .andWhere('transaction.type = :type', { type: 'EXPENSE' })
        .andWhere('transaction.description != :description', {
          description: 'Pagamento recebido',
        })
        .andWhere('transaction.category != :category', {
          category: 'Same person transfer',
        });

      if (filters?.month !== undefined) {
        txQuery.andWhere('EXTRACT(MONTH FROM transaction.date) = :month', {
          month: filters.month + 1,
        });
      }

      if (filters?.year !== undefined) {
        txQuery.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', {
          year: filters.year,
        });
      }

      const transactions = await txQuery
        .orderBy('transaction.date', 'DESC')
        .getMany();

      if (transactions.length > 0) {
        return transactions.map((tx) => ({
          id: tx.id,
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          category: {
            id: 7, // TODO atualizar - Outros Gastos
            name: tx.category,
          },
          source: 'PLUGGY',
        }));
      }

      // Caso não existam transações, retornar despesas manuais
      const queryBuilder = this.repo
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.category', 'category')
        .where('expense.userId = :userId', { userId: user.id });

      filters?.month !== undefined &&
        queryBuilder.andWhere('EXTRACT(MONTH FROM expense.date) = :month', {
          month: filters.month + 1,
        });
      filters?.year !== undefined &&
        queryBuilder.andWhere('EXTRACT(YEAR FROM expense.date) = :year', {
          year: filters.year,
        });

      const expenses = await queryBuilder
        .orderBy('expense.date', 'DESC')
        .getMany();

      return expenses.map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: exp.amount,
        date: exp.date,
        category: exp.category,
        source: 'MANUAL',
      }));
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

  async getTotalByCategory(user: User, filters?: DateFilterDto) {
    try {
      const queryBuilder = this.repo
        .createQueryBuilder('expense')
        .leftJoin('expense.category', 'category')
        .select('category.name', 'category')
        .addSelect('SUM(expense.amount)', 'total')
        .where('expense.userId = :userId', { userId: user.id });

      // Aplicar filtros de data se fornecidos
      if (filters?.month && filters?.year) {
        queryBuilder
          .andWhere('EXTRACT(MONTH FROM expense.date) = :month', {
            month: filters.month,
          })
          .andWhere('EXTRACT(YEAR FROM expense.date) = :year', {
            year: filters.year,
          });
      } else if (filters?.month) {
        queryBuilder.andWhere('EXTRACT(MONTH FROM expense.date) = :month', {
          month: filters.month,
        });
      } else if (filters?.year) {
        queryBuilder.andWhere('EXTRACT(YEAR FROM expense.date) = :year', {
          year: filters.year,
        });
      }

      const result = await queryBuilder
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

  async update(id: number, dto: UpdateExpenseDto, user: User) {
    try {
      const expense = await this.repo.findOne({
        where: { id, user: { id: user.id } },
        relations: ['category'],
      });

      if (!expense) {
        throw new NotFoundException('Despesa não encontrada.');
      }

      // Se a categoria foi alterada, validar se existe
      if (dto.categoryId && dto.categoryId !== expense.category.id) {
        const category = await this.categoryService.findById(dto.categoryId);
        expense.category = category;
      }

      // Atualizar apenas os campos fornecidos
      Object.assign(expense, dto);

      return await this.repo.save(expense);
    } catch (err) {
      this.logger.error('Erro ao atualizar despesa', {
        error: err,
        expenseId: id,
      });

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Erro ao atualizar despesa.');
    }
  }
}
