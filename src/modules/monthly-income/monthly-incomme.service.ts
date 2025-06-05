import { MonthlyIncome } from '@entities/monthly-income.entity';
import { User } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMonthlyIncomeDto } from './dtos/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dtos/update-monthly-income.dto';

@Injectable()
export class MonthlyIncomeService {
  constructor(
    @InjectRepository(MonthlyIncome)
    private readonly repo: Repository<MonthlyIncome>,
  ) {}

  async create(dto: CreateMonthlyIncomeDto, user: User) {
    return this.repo.save({ ...dto, user });
  }

  async findAllByUser(user: User) {
    return this.repo.find({
      where: { user: { id: user.id } },
      order: { referenceMonth: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateMonthlyIncomeDto, user: User) {
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
