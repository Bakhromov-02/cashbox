import { Context as ContextTelegraf } from "telegraf";

export interface Context extends ContextTelegraf {
  session: {
    messageType?: "username" | "password",
    role?: string,
    username?: string,
    token?: string,
    refreshToken?: string,
    isLoggedIn: true | false,
    message_id?: number
  };
}