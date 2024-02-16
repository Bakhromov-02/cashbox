import { forwardRef, Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { ProductsModule } from "../products/products.module";
import { UsersModule } from "../users/users.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { Order } from "./orders.model";
import { User } from "../users/users.model";
import { Product } from "../products/products.model";
import { OrderDetails } from "./order-details.model";
import { JwtModule } from "@nestjs/jwt";
import { BotModule } from "../bot/bot.module";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    SequelizeModule.forFeature([Order, User, Product, OrderDetails]),
    JwtModule,
    BotModule,
    forwardRef(() => ProductsModule),
    UsersModule
  ],
  exports: [
    OrdersService
  ]
})
export class OrdersModule {
}
