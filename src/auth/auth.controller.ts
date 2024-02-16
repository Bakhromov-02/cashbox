import { Body, Controller, Post } from "@nestjs/common";
import { AuthUserDto } from "./dto/auth-user.dto";
import { AuthService } from "./auth.service";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CheckRoleDto } from "./dto/check-role.dto";


@ApiTags("auth")
@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post("/login")
  login(@Body() dto: AuthUserDto) {
    return this.authService.login(dto);
  }

  @Post("/role/check")
  checkRole(@Body() dto: CheckRoleDto) {
    return this.authService.checkRole(dto);
  }
}
