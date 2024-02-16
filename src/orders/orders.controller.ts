import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put, Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Roles } from "../auth/roles-auth.decorator";
import { RolesEnum } from "../constants/roles.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Request } from "express";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { PaginationDto } from "../query-dtos/pagination.dto";
import { FilterDto } from "../query-dtos/filter.dto";


@ApiBearerAuth("JWT-auth")
@ApiTags("orders")
@Controller("api/orders")
export class OrdersController {
  constructor(private orderService: OrdersService) {
  }


  @ApiOperation({ summary: "Create order (cashier, super admin)" })
  @Roles(RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateOrderDto, @Req() request: Request) {
    return this.orderService.create(dto, request);
  }

  // @ApiOperation({ summary: "Get all orders via page" })
  // @Roles(RolesEnum.accountant, RolesEnum.cashier)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get("all/:page")
  // getAll(@Param("page") page: string, @Req() request: Request) {
  //   return this.orderService.getAll(+page, request);
  // }

  @ApiOperation({ summary: "Get all orders via page" })
  @Roles(RolesEnum.accountant, RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("all")
  getAll(@Req() request: Request, @Query() query: PaginationDto) {
    return this.orderService.getAll(query, request);
  }

  // @ApiOperation({ summary: "Get today's orders" })
  // @Roles(RolesEnum.accountant, RolesEnum.cashier)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get("today")
  // getTodays() {
  //   return this.orderService.getTodays();
  // }

  @ApiOperation({ summary: "Get orders by filter" })
  @Roles(RolesEnum.accountant, RolesEnum.cashier)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("filter")
  getByFilter(@Query() query: FilterDto, @Req() request: Request) {
    return this.orderService.getByFilter(query, request);
  }

  @ApiOperation({ summary: "Get order by id" })
  @Roles(RolesEnum.cashier, RolesEnum.accountant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.orderService.getOne(+id, request);
  }

  @ApiOperation({ summary: "Return products (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateOrderDto, @Req() request: Request) {
    return this.orderService.update(+id, dto, request);
  }

  @ApiOperation({ summary: "Return all products (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(":id")
  updateAll(@Param("id") id: string, @Req() request: Request) {
    return this.orderService.updateAll(+id, request);
  }
}
