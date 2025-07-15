import { CategoryService } from '@modules/categories/category.service';
import { CategoryResponseDto } from '@modules/categories/dtos/category-response.dto';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryTypeEnum } from 'types/enums/category-type.enum';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CategoryTypeEnum,
    description: 'Filter categories by type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  findAll(@Query('type') type?: CategoryTypeEnum) {
    return this.service.findAll(type);
  }
}
