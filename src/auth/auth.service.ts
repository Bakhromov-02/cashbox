import { Body, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthUserDto } from "./dto/auth-user.dto";
import { UsersService } from "../users/users.service";
import { User } from "../users/users.model";
import * as bcrypt from "bcryptjs";
import { RolesService } from "../roles/roles.service";

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private jwtService: JwtService, private roleService: RolesService) {
  }


  async login(@Body() dto: AuthUserDto) {
    const user = await this.validateUser(dto);
    const { at, rt } = await this.getToken(user);
    const payload = {
      token: at,
      refreshToken: rt,
      role: user.role.value,
      name: user.name,
      username: user.username
    };
    return payload;
  }

  async checkRole(dto) {
    return this.jwtService.verify(dto.token, { secret: process.env.PRIVATE_KEY });
  }

  // async generateToken(user: User) {
  //   // user.toJSON();
  //   const payload = { username: user.username, name: user.name, id: user.id, role: user.role.value };
  //
  //   return {
  //     token: this.jwtService.sign(payload, { secret: process.env.PRIVATE_KEY }),
  //     refreshToken: this.jwtService.sign(payload, {
  //       secret: process.env.REFRESH_PRIVATE_KEY,
  //       expiresIn: 60 * 60 * 24 * 7
  //     })
  //
  //   };
  // }

  async validateUser(dto: AuthUserDto) {
    const user = await this.userService.getByUsername(dto.username);
    const passwordEquals = await bcrypt.compare(dto.password, user.password);

    if (user && passwordEquals) {
      return user;
    }

    throw new UnauthorizedException({ message: "Wrong email or password" });
  }


  async getToken(user: User): Promise<{ at: string, rt: string }> {
    const payload = { username: user.username, name: user.name, id: user.id, role: user.role.value };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        payload,
        {
          secret: process.env.PRIVATE_KEY,
          expiresIn: "24h"
        }
      ),
      this.jwtService.signAsync(
        payload,
        {
          secret: process.env.REFRESH_PRIVATE_KEY,
          expiresIn: 60 * 60 * 24 * 7
        }
      )
    ]);

    return {
      at, rt
    };
  }
}
