import { Injectable } from "@nestjs/common";
import { Ctx, Hears, InjectBot, Message, On, Start, Update } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { Context } from "./context.interface";
import { UsersService } from "../users/users.service";
import { AuthService } from "../auth/auth.service";
import { RolesEnum } from "../constants/roles.enum";
import { Cron } from "@nestjs/schedule";
import { sessions } from "../app.module";

@Update()
@Injectable()
export class BotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private userService: UsersService,
    private authService: AuthService
  ) {
  }

  @Start()
  async start(ctx: Context) {
    await ctx.reply("Добро пожаловать!");
    await ctx.setChatMenuButton();

    ctx.session.messageType = undefined;
    ctx.session.role = undefined;
    ctx.session.isLoggedIn = false;
    await ctx.reply("Введите свой username.");
    ctx.session.messageType = "username";
  }

  @On("sticker")
  async onSticker(ctx: Context) {
    await ctx.deleteMessage();
    return;
  }

  @On("animation")
  async onGif(ctx: Context) {
    await ctx.deleteMessage();
    return;
  }

  @On("text")
  async getText(@Message("text") message: string, @Ctx() ctx: Context) {

    if (!ctx.session.messageType) {
      await ctx.deleteMessage();
      return;
    }

    if (ctx.session.messageType === "username") {

      const user = await this.userService.getByUsernameForTG(message);

      if (!user) {
        await ctx.reply("Пользователь не найден.");
        ctx.session.messageType = "username";
        return;
      }
      ctx.session.username = user.username;
      ctx.session.role = user.role.value;
      await ctx.reply("Введите пароль.");
      ctx.session.messageType = "password";
      return;
    }

    if (ctx.session.messageType === "password") {
      await ctx.deleteMessage();
      try {
        const userWithToken = await this.authService.login({ username: ctx.session.username, password: message });
        if (userWithToken) {
          ctx.session.isLoggedIn = true;
          ctx.session.token = userWithToken.token;
          ctx.session.refreshToken = userWithToken.refreshToken;
          const user = await this.userService.getByUsernameForTG(ctx.session.username);
          user.telegram_id = ctx.chat.id;
          await user.save();
          ctx.session.messageType = undefined;

          if (userWithToken.role !== RolesEnum.cashier) {
            await ctx.reply("Вы вошли в систему.");
            await ctx.setChatMenuButton({
              type: "web_app",
              text: "Статистика",
              web_app: { url: `https://orderbox.uz/tg/stats?token=${userWithToken.token}&role=${userWithToken.role}` }
            });
          } else {
            await ctx.reply("Вы вошли в систему.");
          }

          return;
        }
      } catch (e) {
        await ctx.reply("Неверный пароль.");
        return;
      }
    }
  }

  async sendOrder(chat_id, order, created: boolean) {
    await this.bot.telegram.sendMessage(chat_id, `
      <b>№ ${order.id}  ${created ? "" : "Обновлено"}</b>\n
⏰ ${order.createdAt.toString().split("").slice(16, 21).join("")}
🧑‍💻 Кассир: ${order.user.name}\n
<b>💵 Наличка:</b> ${order.cash} СУМ
<b>💳 Онлайн:</b> ${order.card} СУМ
${order.returned > 0 ? `<b>😐 Bозвращено:</b> -${order.returned} СУМ` : `<b>😐 Bозвращено:</b> ${order.returned} СУМ`}\n
<b><i>⬇ Продукты</i></b>
${order.products.map((product, index) =>
      `<b>${index + 1}. ${product.name}</b>\n🏷 ${product.price} СУМ, 🟢 ${product.quantity} ШТ, 🔴 ${product.returnedQuantity > 0 ? `<b>-${product.returnedQuantity} ШТ</b>` : `${product.returnedQuantity} ШТ`}`
    ).join("\n")}
    `, { parse_mode: "HTML" });
  }


  @Cron("0 0 20 * * *")
  // @Cron("0 */5 * * * *")
  async cronMessage(ctx: Context) {
    const user = await this.userService.getOne(1);

    const key = `${user.telegram_id}:${user.telegram_id}`;

    const session = JSON.parse(JSON.stringify(sessions.getSession(key)));
    if (!session.isLoggedIn) return;

    if (session.message_id) {
      await this.bot.telegram.deleteMessage(user.telegram_id, session.message_id);
    }

    const { rt, at } = await this.authService.getToken(user);

    session.token = at;

    const message = await this.bot.telegram.sendMessage(user.telegram_id, `Привет, отчет за день.`, {
      reply_markup: {
        inline_keyboard: [[{
          text: "Статистика",
          web_app: { url: `https://orderbox.uz/tg/stats?token=${session.token}&role=${session.role}` }
        }]]
      }
    });

    await sessions.saveSession(key, { ...session, message_id: message.message_id });

    await this.bot.telegram.setChatMenuButton({
        chatId: user.telegram_id,
        menuButton: {
          type: "web_app",
          text: "Статистика",
          web_app: {
            url: `https://orderbox.uz/tg/stats?token=${session.token}&role=${session.role}`
          }
        }
      }
    );

    return;
  }

}
