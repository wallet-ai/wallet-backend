import { AuthenticatedUser } from '@auth/auth-user.decorator';
import { FirebaseAuthGuard } from '@auth/firebase-auth.guard';
import { User } from '@entities/user.entity';
import { CreateExpenseDto } from '@modules/expenses/dtos/create-expense.dto';
import { ExpenseService } from '@modules/expenses/expense.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

@UseGuards(FirebaseAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Post()
  create(@Body() dto: CreateExpenseDto, @AuthenticatedUser() user: User) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@AuthenticatedUser() user: User) {
    return this.service.findAllByUser(user);
  }

  @Get('/categories')
  findAllByCategory(@AuthenticatedUser() user: User) {
    return this.service.getTotalByCategory(user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @AuthenticatedUser() user: User) {
    return this.service.remove(id, user);
  }
}
