import { IsDateString, IsNumber } from 'class-validator';

export class CreateMonthlyIncomeDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  referenceMonth: string;
}
