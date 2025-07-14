import { CategoryService } from '@modules/categories/category.service';
import { CategoryResponseDto } from '@modules/categories/dtos/category-response.dto';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  findAll() {
    return this.service.findAll();
  }
}
