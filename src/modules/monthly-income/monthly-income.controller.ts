import { AuthenticatedUser } from '@auth/auth-user.decorator';
import { FirebaseAuthGuard } from '@auth/firebase-auth.guard';
import { User } from '@entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateMonthlyIncomeDto } from 'modules/monthly-income/dtos/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from 'modules/monthly-income/dtos/update-monthly-income.dto';
import { MonthlyIncomeService } from 'modules/monthly-income/monthly-incomme.service';

@UseGuards(FirebaseAuthGuard)
@Controller('monthly-incomes')
export class MonthlyIncomeController {
  constructor(private readonly service: MonthlyIncomeService) {}

  @Post()
  create(@Body() dto: CreateMonthlyIncomeDto, @AuthenticatedUser() user: User) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@AuthenticatedUser() user: User) {
    return this.service.findAllByUser(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateMonthlyIncomeDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @AuthenticatedUser() user: User) {
    return this.service.remove(id, user);
  }
}
