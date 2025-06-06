import { AuthenticatedUser } from '@auth/auth-user.decorator';
import { FirebaseAuthGuard } from '@auth/firebase-auth.guard';
import { User } from '@entities/user.entity';
import { IncomeService } from '@modules/income/income.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateIncomeDto } from 'modules/income/dtos/create-income.dto';

@UseGuards(FirebaseAuthGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly service: IncomeService) {}

  @Post()
  create(@Body() dto: CreateIncomeDto, @AuthenticatedUser() user: User) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(@AuthenticatedUser() user: User) {
    return this.service.findAllByUser(user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @AuthenticatedUser() user: User) {
    return this.service.remove(id, user);
  }
}
