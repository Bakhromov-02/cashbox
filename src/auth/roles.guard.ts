import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  ForbiddenException,
  UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles-auth.decorator";
import { RolesEnum } from "../constants/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
      if (!requiredRoles) {
        return true;
      }

      // const authHeader = req.headers.authorization;
      // const bearer = authHeader.split(" ")[0];
      // const token = authHeader.split(" ")[1];
      //
      // if (bearer !== "Bearer" || !token) {
      //   throw new UnauthorizedException({ message: "Unauthorized" });
      // }
      //
      // const user = this.jwtService.verify(token, {secret: process.env.PRIVATE_KEY});
      // req.user = user;
      return requiredRoles.includes(req.user.role) || req.user.role === RolesEnum.superAdmin;
      // return true;
    } catch (e) {
      // console.log(e);
      // throw new HttpException(
      //   "Unauthorized",
      //   HttpStatus.FORBIDDEN
      // );

    }
  }

}