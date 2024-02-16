import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./users.model";
import { Roles } from "../roles/roles.model";
import { RolesModule } from "../roles/roles.module";
import { JwtModule } from "@nestjs/jwt";
import { Order } from "../orders/orders.model";
import { OrdersModule } from "../orders/orders.module";
import {OrderDetails} from "../orders/order-details.model";

@Module({
  imports: [
    SequelizeModule.forFeature([User, Roles, Order, OrderDetails]),
    RolesModule,
    JwtModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {
}
