import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
