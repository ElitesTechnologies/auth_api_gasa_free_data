import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { MailService } from "./email.service";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: "smtp.gmail.com", // ou le serveur SMTP que tu utilises
        port: 587,
        secure: false, // Utiliser true si le port est 465
        auth: {
          user: "sephoradidavi6@gmail.com",
          pass: "seph13@Gwl", // Remplace par un mot de passe d'application
        },
      },
      defaults: {
        from: '"TonApplication" <noreply@tonapp.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
