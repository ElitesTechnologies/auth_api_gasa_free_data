import {
  Controller,
  Param,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("SignIn")
  async signIn(
    @Body("email") email: string,
    @Body("password") password: string,
  ) {
    return await this.authService.signin({ email, password });
  }

  //  Route pour demander un code de réinitialisation
  @Post("forgot-password")
  async forgotPassword(@Body("email") email: string) {
    await this.authService.generateResetCode(email);
  }

  //Route pour  vérifier la correspondance du code
  @Post("verifyCode")
  async verifyCode(@Body("email") email: string, @Body("code") code: string) {
    try {
      await this.authService.verifyCode(email, code);
      return {
        status: true,
        message: "le code est correct.",
      };
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          message: "code incorrect",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Route pour réinitialiser le mot de passe
  @Post("reset-password")
  async resetPassword(
    @Body("email") email: string,
    @Body("newPassword") newPassword: string,
  ) {
    try {
      await this.authService.resetPassword(email, newPassword);
      return {
        status: true,
        message: "Mot de passe réinitialisé avec succès.",
      };
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          message: "Email non envoyé",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
