import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CategoriesService } from "./categories.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Roles } from "../auth/roles-auth.decorator";
import { RolesEnum } from "../constants/roles.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { IsAvailableDto } from "../query-dtos/is-available.dto";
import { PaginationDto } from "../query-dtos/pagination.dto";
import { Request } from "express";

@ApiBearerAuth('JWT-auth')
@ApiTags("categories")
@Controller("api/categories")
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {
  }

  @ApiOperation({ summary: "Create category (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiOperation({ summary: "Get all categories" })
  @Roles(RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll(@Query() query: IsAvailableDto, @Req() request: Request) {
    return this.categoriesService.getAll(query, request);
  }

  @ApiOperation({ summary: "Get category by id" })
  @Roles(RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({
    name: "isAvailable",
    type: Boolean,
    required: true
  })
  @Get(":id")
  findByCategory(@Param("id") id: string, @Query() query: PaginationDto) {
    return this.categoriesService.findById(+id, query);
  }

  @ApiOperation({ summary: "Update category (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, dto);
  }

  @ApiOperation({ summary: "Delete category (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.categoriesService.delete(+id);
  }
}
