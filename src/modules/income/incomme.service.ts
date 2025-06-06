import { Income } from '@entities/income.entity';
import { User } from '@entities/user.entity';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { CreateIncomeDto } from './dtos/create-income.dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly repo: Repository<Income>,
    private readonly logger: Logger,
  ) {}

  async create(dto: CreateIncomeDto, user: User) {
    try {
      return await this.repo.save({ ...dto, user });
    } catch (err) {
      this.logger.error('Erro ao salvar renda', { error: err });
      throw new InternalServerErrorException('Erro ao salvar renda.');
    }
  }

  async findAllByUser(user: User) {
    try {
      return await this.repo.find({
        where: { user: { id: user.id } },
      });
    } catch (err) {
      this.logger.error('Erro ao buscar rendas', { error: err });
      throw new InternalServerErrorException('Erro ao buscar rendas.');
    }
  }

  async remove(id: number, user: User) {
    try {
      const income = await this.repo.findOne({
        where: { id, user: { id: user.id } },
      });

      if (!income) {
        throw new NotFoundException('Renda não encontrada.');
      }

      return await this.repo.remove(income);
    } catch (err) {
      this.logger.error('Erro ao remover renda', { error: err });
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Erro ao remover renda.');
    }
  }
}
