import { forwardRef, Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Category } from "./categories.model";
import { Product } from "../products/products.model";
import { ProductsModule } from "../products/products.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    SequelizeModule.forFeature([Category, Product]),
    forwardRef(() => ProductsModule),
    JwtModule
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {
}
