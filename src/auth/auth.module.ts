import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
  imports: [
    UsersModule,
    RolesModule,
    JwtModule.register({
      secret: process.env.PRIVATE_KEY || "secret",
      signOptions: { expiresIn: "24h" }
    })
  ]
})
export class AuthModule {
}
