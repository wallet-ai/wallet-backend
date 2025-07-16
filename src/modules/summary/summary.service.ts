import { Expense } from '@entities/expense.entity';
import { Income } from '@entities/income.entity';
import { User } from '@entities/user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import {
  MonthlySummaryDto,
  YearlySummaryDto,
} from './dtos/monthly-summary.dto';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepo: Repository<Income>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    private readonly logger: Logger,
  ) {}

  async getMonthlySummary(
    user: User,
    year: number,
  ): Promise<MonthlySummaryDto[]> {
    try {
      // Buscar receitas agrupadas por mês
      const incomesByMonth = await this.incomeRepo
        .createQueryBuilder('income')
        .select([
          'EXTRACT(MONTH FROM income.startDate) as month',
          'COALESCE(SUM(income.amount), 0) as total',
        ])
        .where('income.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM income.startDate) = :year', { year })
        .groupBy('EXTRACT(MONTH FROM income.startDate)')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Buscar despesas agrupadas por mês
      const expensesByMonth = await this.expenseRepo
        .createQueryBuilder('expense')
        .select([
          'EXTRACT(MONTH FROM expense.date) as month',
          'COALESCE(SUM(expense.amount), 0) as total',
        ])
        .where('expense.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM expense.date) = :year', { year })
        .groupBy('EXTRACT(MONTH FROM expense.date)')
        .orderBy('month', 'ASC')
        .getRawMany();

      // Criar mapa de receitas por mês
      const incomesMap = new Map<number, number>();
      incomesByMonth.forEach((item) => {
        incomesMap.set(parseInt(item.month), parseFloat(item.total));
      });

      // Criar mapa de despesas por mês
      const expensesMap = new Map<number, number>();
      expensesByMonth.forEach((item) => {
        expensesMap.set(parseInt(item.month), parseFloat(item.total));
      });

      // Criar resumo para todos os 12 meses
      const monthlySummaries: MonthlySummaryDto[] = [];
      for (let month = 1; month <= 12; month++) {
        const totalIncomes = incomesMap.get(month) || 0;
        const totalExpenses = expensesMap.get(month) || 0;

        monthlySummaries.push({
          year,
          month,
          totalIncomes,
          totalExpenses,
          balance: totalIncomes - totalExpenses,
        });
      }

      return monthlySummaries;
    } catch (err) {
      this.logger.error('Erro ao buscar resumo mensal', { error: err });
      throw new InternalServerErrorException('Erro ao buscar resumo mensal.');
    }
  }

  async getYearlySummary(user: User, year: number): Promise<YearlySummaryDto> {
    try {
      const monthlySummaries = await this.getMonthlySummary(user, year);

      const totalYearIncomes = monthlySummaries.reduce(
        (sum, month) => sum + month.totalIncomes,
        0,
      );
      const totalYearExpenses = monthlySummaries.reduce(
        (sum, month) => sum + month.totalExpenses,
        0,
      );

      return {
        year,
        monthlySummaries,
        totalYearIncomes,
        totalYearExpenses,
        yearBalance: totalYearIncomes - totalYearExpenses,
      };
    } catch (err) {
      this.logger.error('Erro ao buscar resumo anual', { error: err });
      throw new InternalServerErrorException('Erro ao buscar resumo anual.');
    }
  }
}
