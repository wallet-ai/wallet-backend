import { IsNumber, IsString } from 'class-validator';

export class CreateRecurringIncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;
}
