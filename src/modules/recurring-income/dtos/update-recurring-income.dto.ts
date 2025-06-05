import { PartialType } from '@nestjs/mapped-types';
import { CreateRecurringIncomeDto } from './create-recurring-income.dto';

export class UpdateRecurringIncomeDto extends PartialType(
  CreateRecurringIncomeDto,
) {}
