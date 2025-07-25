import { AuthenticatedUser } from '@auth/auth-user.decorator';
import { FirebaseAuthGuard } from '@auth/firebase-auth.guard';
import { User } from '@entities/user.entity';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InvestmentService } from './investment.service';

@ApiBearerAuth('firebase-auth')
@UseGuards(FirebaseAuthGuard)
@Controller('investments')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Get()
  async findAllByUser(@Query('userId') userId: number) {
    return this.investmentService.findAllByUser(userId);
  }

  @Get('/sync')
  async syncInvestments(@AuthenticatedUser() user: User) {
    console.log('aqui');
    return await this.investmentService.syncInvestmentsFromPluggy(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }
}
