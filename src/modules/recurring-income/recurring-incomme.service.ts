import { RecurringIncome } from '@entities/recurring-income.entity';
import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecurringIncomeDto } from './dtos/create-recurring-income.dto';
import { UpdateRecurringIncomeDto } from './dtos/update-recurring-income.dto';

@Injectable()
export class RecurringIncomeService {
  constructor(
    @InjectRepository(RecurringIncome)
    private readonly repo: Repository<RecurringIncome>,
  ) {}

  async create(dto: CreateRecurringIncomeDto, user: User) {
    return this.repo.save({ ...dto, user });
  }

  async findAllByUser(user: User) {
    return this.repo.find({
      where: { user: { id: user.id } },
    });
  }

  async update(id: number, dto: UpdateRecurringIncomeDto, user: User) {
    const income = await this.repo.findOneOrFail({
      where: { id, user: { id: user.id } },
    });
    Object.assign(income, dto);
    return this.repo.save(income);
  }

  async remove(id: number, user: User) {
    const income = await this.repo.findOneOrFail({
      where: { id, user: { id: user.id } },
    });
    return this.repo.remove(income);
  }
}
