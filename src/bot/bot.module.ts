import { forwardRef, Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [UsersModule, AuthModule],
  providers: [BotService],
  exports: [BotService]
})
export class BotModule {
}
