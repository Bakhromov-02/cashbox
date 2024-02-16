import { Module } from "@nestjs/common";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Roles } from "./roles.model";
import { User } from "../users/users.model";
import { JwtModule } from "@nestjs/jwt";

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    SequelizeModule.forFeature([Roles, User]),
    JwtModule
  ],
  exports: [RolesService]
})
export class RolesModule {
}
