import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Roles } from "../auth/roles-auth.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesEnum } from "../constants/roles.enum";
import { Request } from "express";
import { IsAvailableDto } from "../query-dtos/is-available.dto";

@ApiBearerAuth('JWT-auth')
@ApiTags("users")
@Controller("api/users")
export class UsersController {
  constructor(private userService: UsersService) {
  }

  @ApiOperation({ summary: "Create user (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({ summary: "Get all users (super admin)" })
  @Roles(RolesEnum.accountant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll(@Query() query: IsAvailableDto) {
    return this.userService.getAll(query);
  }

  @ApiOperation({ summary: "Get user by id (super admin)" })
  @Roles(RolesEnum.accountant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.userService.getOne(+id);
  }

  @ApiOperation({ summary: "Update user (Role can be changed by super admin)" })
  @Roles(RolesEnum.cashier, RolesEnum.accountant)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto, @Req() request: Request) {
    return this.userService.update(+id, dto, request);
  }

  @ApiOperation({ summary: "Delete user (super admin)" })
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.userService.delete(+id);
  }

}
