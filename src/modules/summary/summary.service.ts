import { Expense } from '@entities/expense.entity';
import { Income } from '@entities/income.entity';
import { User } from '@entities/user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
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

  async getMonthlyDataForExport(user: User, year: number, month: number) {
    try {
      // Buscar receitas do mês
      const incomes = await this.incomeRepo
        .createQueryBuilder('income')
        .leftJoinAndSelect('income.category', 'category')
        .where('income.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM income.startDate) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM income.startDate) = :month', { month })
        .orderBy('income.startDate', 'ASC')
        .getMany();

      // Buscar despesas do mês
      const expenses = await this.expenseRepo
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.category', 'category')
        .where('expense.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM expense.date) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM expense.date) = :month', { month })
        .orderBy('expense.date', 'ASC')
        .getMany();

      return { incomes, expenses };
    } catch (err) {
      this.logger.error('Erro ao buscar dados mensais para exportação', {
        error: err,
        userId: user.id,
        year,
        month,
      });
      throw new InternalServerErrorException(
        'Erro ao buscar dados para exportação.',
      );
    }
  }

  async getMonthlyDataByCategory(user: User, year: number, month: number) {
    try {
      // Buscar receitas agrupadas por categoria
      const incomesByCategory = await this.incomeRepo
        .createQueryBuilder('income')
        .leftJoinAndSelect('income.category', 'category')
        .select([
          'category.name as categoryName',
          'COALESCE(SUM(income.amount), 0) as total',
          'COUNT(income.id) as count',
        ])
        .where('income.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM income.startDate) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM income.startDate) = :month', { month })
        .groupBy('category.id, category.name')
        .orderBy('total', 'DESC')
        .getRawMany();

      // Buscar despesas agrupadas por categoria
      const expensesByCategory = await this.expenseRepo
        .createQueryBuilder('expense')
        .leftJoinAndSelect('expense.category', 'category')
        .select([
          'category.name as categoryName',
          'COALESCE(SUM(expense.amount), 0) as total',
          'COUNT(expense.id) as count',
        ])
        .where('expense.userId = :userId', { userId: user.id })
        .andWhere('EXTRACT(YEAR FROM expense.date) = :year', { year })
        .andWhere('EXTRACT(MONTH FROM expense.date) = :month', { month })
        .groupBy('category.id, category.name')
        .orderBy('total', 'DESC')
        .getRawMany();

      return { incomesByCategory, expensesByCategory };
    } catch (err) {
      this.logger.error('Erro ao buscar dados por categoria para exportação', {
        error: err,
        userId: user.id,
        year,
        month,
      });
      throw new InternalServerErrorException(
        'Erro ao buscar dados por categoria para exportação.',
      );
    }
  }

  async exportMonthlyDataToExcel(
    user: User,
    year: number,
    month: number,
  ): Promise<Buffer> {
    try {
      const { incomes, expenses } = await this.getMonthlyDataForExport(
        user,
        year,
        month,
      );

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Wallet App';
      workbook.created = new Date();

      // Aba de Receitas
      const incomeSheet = workbook.addWorksheet('Receitas');
      incomeSheet.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Descrição', key: 'description', width: 30 },
        { header: 'Categoria', key: 'category', width: 20 },
        { header: 'Valor (R$)', key: 'amount', width: 15 },
      ];

      // Estilo do cabeçalho - aplicar apenas às células com dados
      const incomeHeaderRow = incomeSheet.getRow(1);
      for (let col = 1; col <= 4; col++) {
        const cell = incomeHeaderRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4CAF50' },
        };
      }

      // Adicionar dados de receitas
      incomes.forEach((income) => {
        incomeSheet.addRow({
          date: income.startDate,
          description: income.description,
          category: income.category?.name || 'Sem categoria',
          amount: parseFloat(income.amount.toString()),
        });
      });

      // Formatar coluna de valores
      incomeSheet.getColumn('amount').numFmt = 'R$ #,##0.00';

      // Total de receitas
      const totalIncomes = incomes.reduce(
        (sum, income) => sum + parseFloat(income.amount.toString()),
        0,
      );
      const totalIncomeRow = incomeSheet.addRow({
        date: '',
        description: 'TOTAL',
        category: '',
        amount: totalIncomes,
      });
      // Aplicar estilo apenas às células com dados
      for (let col = 1; col <= 4; col++) {
        const cell = totalIncomeRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F5E8' },
        };
      }

      // Aba de Despesas
      const expenseSheet = workbook.addWorksheet('Despesas');
      expenseSheet.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Descrição', key: 'description', width: 30 },
        { header: 'Categoria', key: 'category', width: 20 },
        { header: 'Valor (R$)', key: 'amount', width: 15 },
      ];

      // Estilo do cabeçalho - aplicar apenas às células com dados
      const expenseHeaderRow = expenseSheet.getRow(1);
      for (let col = 1; col <= 4; col++) {
        const cell = expenseHeaderRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF44336' },
        };
      }

      // Adicionar dados de despesas
      expenses.forEach((expense) => {
        expenseSheet.addRow({
          date: expense.date,
          description: expense.description,
          category: expense.category?.name || 'Sem categoria',
          amount: parseFloat(expense.amount.toString()),
        });
      });

      // Formatar coluna de valores
      expenseSheet.getColumn('amount').numFmt = 'R$ #,##0.00';

      // Total de despesas
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount.toString()),
        0,
      );
      const totalExpenseRow = expenseSheet.addRow({
        date: '',
        description: 'TOTAL',
        category: '',
        amount: totalExpenses,
      });
      // Aplicar estilo apenas às células com dados
      for (let col = 1; col <= 4; col++) {
        const cell = totalExpenseRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFDE8E8' },
        };
      }

      // Aba de Resumo
      const summarySheet = workbook.addWorksheet('Resumo');
      summarySheet.columns = [
        { header: 'Tipo', key: 'type', width: 20 },
        { header: 'Valor (R$)', key: 'amount', width: 20 },
      ];

      // Estilo do cabeçalho - aplicar apenas às células com dados
      const summaryHeaderRow = summarySheet.getRow(1);
      for (let col = 1; col <= 2; col++) {
        const cell = summaryHeaderRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2196F3' },
        };
      }

      const balance = totalIncomes - totalExpenses;
      const summaryData = [
        { type: 'Total de Receitas', amount: totalIncomes },
        { type: 'Total de Despesas', amount: totalExpenses },
        { type: 'Saldo', amount: balance },
      ];

      summaryData.forEach((item, index) => {
        const row = summarySheet.addRow(item);
        if (index === 2) {
          // Linha do saldo
          // Aplicar estilo apenas às células com dados
          for (let col = 1; col <= 2; col++) {
            const cell = row.getCell(col);
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: balance >= 0 ? 'FFE8F5E8' : 'FFFDE8E8' },
            };
          }
        }
      });

      summarySheet.getColumn('amount').numFmt = 'R$ #,##0.00';

      // Gerar buffer do Excel
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (err) {
      this.logger.error('Erro ao exportar dados para Excel', {
        error: err,
        userId: user.id,
        year,
        month,
      });
      throw new InternalServerErrorException('Erro ao gerar arquivo Excel.');
    }
  }

  async exportMonthlyCategoryDataToExcel(
    user: User,
    year: number,
    month: number,
  ): Promise<Buffer> {
    try {
      const { incomesByCategory, expensesByCategory } =
        await this.getMonthlyDataByCategory(user, year, month);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Wallet App';
      workbook.created = new Date();

      // Aba de Receitas por Categoria
      const incomeSheet = workbook.addWorksheet('Receitas por Categoria');
      incomeSheet.columns = [
        { header: 'Categoria', key: 'category', width: 25 },
        { header: 'Quantidade', key: 'count', width: 15 },
        { header: 'Valor Total (R$)', key: 'total', width: 18 },
        { header: 'Percentual (%)', key: 'percentage', width: 15 },
      ];

      // Estilo do cabeçalho
      const incomeHeaderRow = incomeSheet.getRow(1);
      for (let col = 1; col <= 4; col++) {
        const cell = incomeHeaderRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4CAF50' },
        };
        cell.alignment = { horizontal: 'center' };
      }

      // Calcular total de receitas para percentuais
      const totalIncomes = incomesByCategory.reduce(
        (sum, item) => sum + parseFloat(item.total),
        0,
      );

      // Adicionar dados de receitas por categoria
      incomesByCategory.forEach((item) => {
        const percentage =
          totalIncomes > 0 ? (parseFloat(item.total) / totalIncomes) * 100 : 0;
        incomeSheet.addRow({
          category: item.categoryname || 'Sem categoria',
          count: parseInt(item.count),
          total: parseFloat(item.total),
          percentage: percentage,
        });
      });

      // Formatar colunas
      incomeSheet.getColumn('total').numFmt = 'R$ #,##0.00';
      incomeSheet.getColumn('percentage').numFmt = '0.00"%"';
      incomeSheet.getColumn('count').alignment = { horizontal: 'center' };

      // Total de receitas
      const totalIncomeRow = incomeSheet.addRow({
        category: 'TOTAL',
        count: incomesByCategory.reduce(
          (sum, item) => sum + parseInt(item.count),
          0,
        ),
        total: totalIncomes,
        percentage: 100,
      });
      for (let col = 1; col <= 4; col++) {
        const cell = totalIncomeRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F5E8' },
        };
      }

      // Aba de Despesas por Categoria
      const expenseSheet = workbook.addWorksheet('Despesas por Categoria');
      expenseSheet.columns = [
        { header: 'Categoria', key: 'category', width: 25 },
        { header: 'Quantidade', key: 'count', width: 15 },
        { header: 'Valor Total (R$)', key: 'total', width: 18 },
        { header: 'Percentual (%)', key: 'percentage', width: 15 },
      ];

      // Estilo do cabeçalho
      const expenseHeaderRow = expenseSheet.getRow(1);
      for (let col = 1; col <= 4; col++) {
        const cell = expenseHeaderRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF44336' },
        };
        cell.alignment = { horizontal: 'center' };
      }

      // Calcular total de despesas para percentuais
      const totalExpenses = expensesByCategory.reduce(
        (sum, item) => sum + parseFloat(item.total),
        0,
      );

      // Adicionar dados de despesas por categoria
      expensesByCategory.forEach((item) => {
        const percentage =
          totalExpenses > 0
            ? (parseFloat(item.total) / totalExpenses) * 100
            : 0;
        expenseSheet.addRow({
          category: item.categoryname || 'Sem categoria',
          count: parseInt(item.count),
          total: parseFloat(item.total),
          percentage: percentage,
        });
      });

      // Formatar colunas
      expenseSheet.getColumn('total').numFmt = 'R$ #,##0.00';
      expenseSheet.getColumn('percentage').numFmt = '0.00"%"';
      expenseSheet.getColumn('count').alignment = { horizontal: 'center' };

      // Total de despesas
      const totalExpenseRow = expenseSheet.addRow({
        category: 'TOTAL',
        count: expensesByCategory.reduce(
          (sum, item) => sum + parseInt(item.count),
          0,
        ),
        total: totalExpenses,
        percentage: 100,
      });
      for (let col = 1; col <= 4; col++) {
        const cell = totalExpenseRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFDE8E8' },
        };
      }

      // Aba de Comparativo Geral
      const comparisonSheet = workbook.addWorksheet(
        'Comparativo por Categoria',
      );
      comparisonSheet.columns = [
        { header: 'Categoria', key: 'category', width: 25 },
        { header: 'Receitas (R$)', key: 'incomes', width: 18 },
        { header: 'Despesas (R$)', key: 'expenses', width: 18 },
        { header: 'Saldo (R$)', key: 'balance', width: 18 },
      ];

      // Estilo do cabeçalho
      const comparisonHeaderRow = comparisonSheet.getRow(1);
      for (let col = 1; col <= 4; col++) {
        const cell = comparisonHeaderRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2196F3' },
        };
        cell.alignment = { horizontal: 'center' };
      }

      // Criar mapa de categorias
      const categoryMap = new Map();

      incomesByCategory.forEach((item) => {
        const categoryName = item.categoryname || 'Sem categoria';
        categoryMap.set(categoryName, {
          category: categoryName,
          incomes: parseFloat(item.total),
          expenses: 0,
        });
      });

      expensesByCategory.forEach((item) => {
        const categoryName = item.categoryname || 'Sem categoria';
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName).expenses = parseFloat(item.total);
        } else {
          categoryMap.set(categoryName, {
            category: categoryName,
            incomes: 0,
            expenses: parseFloat(item.total),
          });
        }
      });

      // Adicionar dados comparativos
      Array.from(categoryMap.values())
        .sort((a, b) => b.incomes - b.expenses - (a.incomes - a.expenses))
        .forEach((item) => {
          const balance = item.incomes - item.expenses;
          const row = comparisonSheet.addRow({
            category: item.category,
            incomes: item.incomes,
            expenses: item.expenses,
            balance: balance,
          });

          // Colorir saldo baseado no valor
          const balanceCell = row.getCell(4);
          balanceCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: balance >= 0 ? 'FFE8F5E8' : 'FFFDE8E8' },
          };
        });

      // Formatar colunas monetárias
      comparisonSheet.getColumn('incomes').numFmt = 'R$ #,##0.00';
      comparisonSheet.getColumn('expenses').numFmt = 'R$ #,##0.00';
      comparisonSheet.getColumn('balance').numFmt = 'R$ #,##0.00';

      // Total geral
      const generalBalance = totalIncomes - totalExpenses;
      const totalRow = comparisonSheet.addRow({
        category: 'TOTAL GERAL',
        incomes: totalIncomes,
        expenses: totalExpenses,
        balance: generalBalance,
      });
      for (let col = 1; col <= 4; col++) {
        const cell = totalRow.getCell(col);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: generalBalance >= 0 ? 'FFE8F5E8' : 'FFFDE8E8' },
        };
      }

      // Gerar buffer do Excel
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (err) {
      this.logger.error('Erro ao exportar dados por categoria para Excel', {
        error: err,
        userId: user.id,
        year,
        month,
      });
      throw new InternalServerErrorException(
        'Erro ao gerar arquivo Excel por categoria.',
      );
    }
  }
}
