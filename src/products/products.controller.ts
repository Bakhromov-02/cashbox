import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsService } from "./products.service";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Roles } from "../auth/roles-auth.decorator";
import { RolesEnum } from "../constants/roles.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { IsAvailableDto } from "../query-dtos/is-available.dto";
import { PaginationDto } from "../query-dtos/pagination.dto";

@ApiBearerAuth('JWT-auth')
@ApiTags("products")
@Controller("api/products")
export class ProductsController {
  constructor(private productService: ProductsService) {
  }

  @ApiOperation({ summary: "Create product (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @ApiOperation({ summary: "Get all products" })
  @Roles(RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll(@Query() query: IsAvailableDto) {
    return this.productService.getAll(query);
  }

  @ApiOperation({ summary: "Get product by id" })
  @Roles(RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  getById(@Param("id") id: string) {
    return this.productService.getById(+id);
  }

  @ApiOperation({ summary: "Update product (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(+id, dto);
  }

  @ApiOperation({ summary: "Delete product (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.productService.delete(+id);
  }
}
