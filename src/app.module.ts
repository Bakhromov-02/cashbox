import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { RolesModule } from "./roles/roles.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { Product } from "./products/products.model";
import { Category } from "./categories/categories.model";
import { User } from "./users/users.model";
import { Roles } from "./roles/roles.model";
import { AuthModule } from "./auth/auth.module";
import { OrdersModule } from "./orders/orders.module";
import { Order } from "./orders/orders.model";
import { OrderDetails } from "./orders/order-details.model";
import { PriceHistory } from "./products/price-history.model";
import { BotModule } from "./bot/bot.module";
import { TelegrafModule } from "nestjs-telegraf";
import * as LocalSession from "telegraf-session-local";
import { ScheduleModule } from "@nestjs/schedule";

export let sessions = new LocalSession({
  database: "session_db.json"
});


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ".env"
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Product, PriceHistory, Category, User, Roles, Order, OrderDetails],
      autoLoadModels: true
    }),
    TelegrafModule.forRoot({
      token: process.env.TG_BOT_TOKEN,
      middlewares: [sessions.middleware()]
    }),
    UsersModule,
    RolesModule,
    CategoriesModule,
    ProductsModule,
    AuthModule,
    OrdersModule,
    BotModule
  ],
  controllers: []
})

export class AppModule {
}
