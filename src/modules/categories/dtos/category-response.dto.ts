import { ApiProperty } from '@nestjs/swagger';
import { CategoryTypeEnum } from 'types/enums/category-type.enum';

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  id: number;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({
    description: 'Category type',
    enum: CategoryTypeEnum,
    example: CategoryTypeEnum.EXPENSE,
  })
  type: CategoryTypeEnum;
}
