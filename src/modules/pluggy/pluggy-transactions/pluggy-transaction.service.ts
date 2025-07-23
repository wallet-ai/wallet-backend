import { DateFilterDto } from '@common/dtos/date-filter.dto';
import { Transaction } from '@entities/transaction.entity';
import { User } from '@entities/user.entity';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';

@Injectable()
export class PluggyTransactionService {
  private readonly logger = new Logger(PluggyTransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async fetchAndSaveTransactions(
    itemId: string,
    userId: number,
  ): Promise<Transaction[]> {
    const apiKey = process.env.PLUGGY_API_KEY;

    // 1. Buscar lista de categorias com tradução
    const categoriesRes = await axios.get('https://api.pluggy.ai/categories', {
      headers: { 'X-API-KEY': apiKey },
    });

    const categoryMap = new Map<string, string>();
    for (const cat of categoriesRes.data.results) {
      console.log(
        'Categoria:',
        cat.description,
        'Tradução:',
        cat.descriptionTranslated,
      );
      categoryMap.set(cat.description, cat.descriptionTranslated);
    }

    // 2. Buscar contas do item
    const accountRes = await axios.get(
      `https://api.pluggy.ai/accounts?itemId=${itemId}`,
      {
        headers: { 'X-API-KEY': apiKey },
      },
    );

    const all: Transaction[] = [];

    for (const account of accountRes.data.results) {
      let page = 1;

      while (true) {
        const res = await axios.get(
          `https://api.pluggy.ai/transactions?accountId=${account.id}`,
          {
            headers: { 'X-API-KEY': apiKey },
            params: { page, pageSize: 500 },
          },
        );

        const { results } = res.data;
        if (!results.length) break;

        for (const tx of results) {
          const exists = await this.transactionRepo.findOneBy({
            pluggyTransactionId: tx.id,
          });
          if (exists) {
            all.push(exists);
            continue;
          }

          // 3. Traduzir a categoria se existir
          const translatedCategory =
            categoryMap.get(tx.category) || tx.category;

          const newTx = this.transactionRepo.create({
            pluggyTransactionId: tx.id,
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            type: tx.amount > 0 ? 'INCOME' : 'EXPENSE',
            category: translatedCategory,
            accountId: account.id,
            itemId,
            user: { id: userId },
          });

          await this.transactionRepo.save(newTx);
          all.push(newTx);
        }

        page++;
      }
    }

    return all;
  }

  async getIncomesByUser(user: User, filters?: DateFilterDto) {
    try {
      const queryBuilder = this.transactionRepo
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId', { userId: user.id })
        .andWhere('transaction.type = :type', { type: 'INCOME' });

      if (filters?.month !== undefined) {
        queryBuilder.andWhere('EXTRACT(MONTH FROM transaction.date) = :month', {
          month: filters.month + 1,
        });
      }

      if (filters?.year !== undefined) {
        queryBuilder.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', {
          year: filters.year,
        });
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error('Error fetching incomes:', error);
      throw error;
    }
  }

  async getExpensesByUser(user: User, filters?: DateFilterDto) {
    try {
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

      return await txQuery.orderBy('transaction.date', 'DESC').getMany();
    } catch (error) {
      this.logger.error('Error fetching incomes:', error);
      throw error;
    }
  }

  async getMonthlySummary(user: User, year: number) {
    const pluggyIncomesByMonth = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select([
        'EXTRACT(MONTH FROM transaction.date) as month',
        'COALESCE(SUM(transaction.amount), 0) as total',
      ])
      .where('transaction.userId = :userId', { userId: user.id })
      .andWhere('transaction.type = :type', { type: 'INCOME' })
      .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM transaction.date)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const pluggyExpensesByMonth = await this.transactionRepo
      .createQueryBuilder('transaction')
      .select([
        'EXTRACT(MONTH FROM transaction.date) as month',
        'COALESCE(SUM(transaction.amount), 0) as total',
      ])
      .where('transaction.userId = :userId', { userId: user.id })
      .andWhere('transaction.type = :type', { type: 'EXPENSE' })
      .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM transaction.date)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return { pluggyIncomesByMonth, pluggyExpensesByMonth };
  }

  async getMonthlyPluggyDataForExport(user: User, year: number, month: number) {
    try {
      // Buscar receitas do mês
      const pluggyIncomesByMonth = await this.transactionRepo
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId', { userId: user.id })
        .andWhere('transaction.type = :type', { type: 'INCOME' })
        .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', {
          month,
        })
        .orderBy('transaction.date', 'ASC')
        .getMany();

      // Buscar despesas do mês
      const pluggyExpensesByMonth = await this.transactionRepo
        .createQueryBuilder('transaction')
        .where('transaction.userId = :userId', { userId: user.id })
        .andWhere('transaction.type = :type', { type: 'EXPENSE' })
        .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', {
          month,
        })
        .orderBy('transaction.date', 'ASC')
        .getMany();

      return { pluggyIncomesByMonth, pluggyExpensesByMonth };
    } catch (err) {
      this.logger.error('Erro ao buscar dados mensais para exportação', {
        error: err,
        userId: user.id,
        year,
        month,
      });
      throw new InternalServerErrorException(
        'Erro ao buscar dados no Pluggy para exportação.',
      );
    }
  }

  async getMonthlyPluggyDataByCategory(
    user: User,
    year: number,
    month: number,
  ): Promise<{
    incomesByCategory: { categoryName: string; total: number; count: number }[];
    expensesByCategory: {
      categoryName: string;
      total: number;
      count: number;
    }[];
  }> {
    try {
      const query = this.transactionRepo
        .createQueryBuilder('transaction')
        .select([
          'transaction.category as "categoryName"',
          'transaction.type as type',
          'COALESCE(SUM(transaction.amount), 0) as total',
          'COUNT(transaction.id) as count',
        ])
        .where('transaction.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month })
        .groupBy('transaction.category, transaction.type')
        .orderBy('total', 'DESC');

      const results = await query.getRawMany();

      const incomesByCategory = results
        .filter((r) => r.type === 'INCOME')
        .map((r) => ({
          categoryName: r.categoryName,
          total: parseFloat(r.total),
          count: parseInt(r.count),
        }));

      const expensesByCategory = results
        .filter((r) => r.type === 'EXPENSE')
        .map((r) => ({
          categoryName: r.categoryName,
          total: parseFloat(r.total) * -1,
          count: parseInt(r.count),
        }));

      return { incomesByCategory, expensesByCategory };
    } catch (err) {
      this.logger.error(
        'Erro ao buscar dados por categoria nas transações do Pluggy',
        {
          error: err,
          userId: user.id,
          year,
          month,
        },
      );
      throw new InternalServerErrorException(
        'Erro ao buscar dados por categoria nas transações do Pluggy.',
      );
    }
  }

  async getYearlyEvolutionDataFromPluggy(
    user: User,
    year: number,
  ): Promise<{
    monthlyIncomes: {
      month: number;
      total: number;
      count: number;
      average: number;
    }[];
    monthlyExpenses: {
      month: number;
      total: number;
      count: number;
      average: number;
    }[];
  }> {
    try {
      const results = await this.transactionRepo
        .createQueryBuilder('transaction')
        .select([
          'EXTRACT(MONTH FROM transaction.date) as "month"',
          'transaction.type as "type"',
          'COALESCE(SUM(transaction.amount), 0) as "total"',
          'COUNT(transaction.id) as "count"',
          'COALESCE(AVG(transaction.amount), 0) as "average"',
        ])
        .where('transaction.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year })
        .groupBy('EXTRACT(MONTH FROM transaction.date), transaction.type')
        .orderBy('month', 'ASC')
        .addOrderBy('type', 'ASC')
        .getRawMany();

      const monthlyIncomes = results
        .filter((r) => r.type === 'INCOME')
        .map((r) => ({
          month: parseInt(r.month),
          total: parseFloat(r.total),
          count: parseInt(r.count),
          average: parseFloat(r.average),
        }));

      const monthlyExpenses = results
        .filter((r) => r.type === 'EXPENSE')
        .map((r) => ({
          month: parseInt(r.month),
          total: parseFloat(r.total) * -1,
          count: parseInt(r.count),
          average: parseFloat(r.average),
        }));

      return { monthlyIncomes, monthlyExpenses };
    } catch (err) {
      this.logger.error(
        'Erro ao buscar evolução anual nas transações do Pluggy',
        {
          error: err,
          userId: user.id,
          year,
        },
      );
      throw new InternalServerErrorException(
        'Erro ao buscar evolução anual nas transações do Pluggy.',
      );
    }
  }
}
