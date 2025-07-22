import { Transaction } from '@entities/transaction.entity';
import { Injectable, Logger } from '@nestjs/common';
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
    const accountRes = await axios.get(
      `https://api.pluggy.ai/accounts?itemId=${itemId}`,
      {
        headers: { 'X-API-KEY': process.env.PLUGGY_API_KEY },
      },
    );

    console.log('accountRes:', accountRes.data);

    const all: Transaction[] = [];

    for (const account of accountRes.data.results) {
      let page = 1;

      while (true) {
        const res = await axios.get(
          `https://api.pluggy.ai/transactions?accountId=${account.id}`,
          {
            headers: { 'X-API-KEY': process.env.PLUGGY_API_KEY },
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

          const newTx = this.transactionRepo.create({
            pluggyTransactionId: tx.id,
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            type: tx.amount > 0 ? 'INCOME' : 'EXPENSE',
            category: tx.category,
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
}
