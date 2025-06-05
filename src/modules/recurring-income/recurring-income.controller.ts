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
import { CreateRecurringIncomeDto } from 'modules/recurring-income/dtos/create-recurring-income.dto';
import { UpdateRecurringIncomeDto } from 'modules/recurring-income/dtos/update-recurring-income.dto';
import { RecurringIncomeService } from 'modules/recurring-income/recurring-incomme.service';

@UseGuards(FirebaseAuthGuard)
@Controller('recurring-incomes')
export class RecurringIncomeController {
  constructor(private readonly service: RecurringIncomeService) {}

  @Post()
  create(
    @Body() dto: CreateRecurringIncomeDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@AuthenticatedUser() user: User) {
    return this.service.findAllByUser(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() dto: UpdateRecurringIncomeDto,
    @AuthenticatedUser() user: User,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @AuthenticatedUser() user: User) {
    return this.service.remove(id, user);
  }
}
