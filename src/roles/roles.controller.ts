import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles-auth.decorator";
import { RolesEnum } from "../constants/roles.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiBearerAuth('JWT-auth')
@ApiTags("roles")
@Controller("api/roles")
export class RolesController {
  constructor(private rolesService: RolesService) {
  }

  @ApiOperation({summary: 'Get all roles except of super admin (super admin)'})
  @Roles(RolesEnum.superAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  getAll() {
    return this.rolesService.getAll();
  }
}
