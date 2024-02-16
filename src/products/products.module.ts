import { forwardRef, Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Category } from "../categories/categories.model";
import { Product } from "./products.model";
import { CategoriesModule } from "../categories/categories.module";
import { JwtModule } from "@nestjs/jwt";
import { OrdersModule } from "../orders/orders.module";
import { Order } from "../orders/orders.model";
import { PriceHistory } from "./price-history.model";

@Module({
  imports: [
    SequelizeModule.forFeature([Product, Category, Order, PriceHistory]),
    forwardRef(() => CategoriesModule),
    forwardRef(() => OrdersModule),
    JwtModule

  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {
}
