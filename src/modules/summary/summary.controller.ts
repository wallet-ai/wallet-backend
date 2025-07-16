import { AuthenticatedUser } from '@auth/auth-user.decorator';
import { FirebaseAuthGuard } from '@auth/firebase-auth.guard';
import { User } from '@entities/user.entity';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  MonthlySummaryDto,
  YearlySummaryDto,
} from './dtos/monthly-summary.dto';
import { SummaryService } from './summary.service';

@ApiTags('Summary')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('monthly')
  @ApiOperation({
    summary: 'Obter resumo de todos os meses',
    description:
      'Retorna o resumo financeiro de todos os meses de um ano específico agrupados por mês.',
  })
  @ApiQuery({
    name: 'year',
    required: true,
    type: Number,
    description: 'Ano (ex: 2025)',
    example: 2025,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo mensal obtido com sucesso',
    type: [MonthlySummaryDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async getMonthlySummary(
    @AuthenticatedUser() user: User,
    @Query('year') year: number,
  ): Promise<MonthlySummaryDto[]> {
    return this.summaryService.getMonthlySummary(user, year);
  }

  @Get('yearly')
  @ApiOperation({
    summary: 'Obter resumo anual completo',
    description:
      'Retorna o resumo financeiro de um ano completo com dados mensais e totais anuais.',
  })
  @ApiQuery({
    name: 'year',
    required: true,
    type: Number,
    description: 'Ano (ex: 2025)',
    example: 2025,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumo anual obtido com sucesso',
    type: YearlySummaryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async getYearlySummary(
    @AuthenticatedUser() user: User,
    @Query('year') year: number,
  ): Promise<YearlySummaryDto> {
    return this.summaryService.getYearlySummary(user, year);
  }
}
