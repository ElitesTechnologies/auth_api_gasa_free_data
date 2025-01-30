import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { User } from "./users/users.entity";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./email/email.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // pour rendre les variables d'environnement globales
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "free_data",
      entities: [User],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    MailModule,
  ],
  providers: [],
})
export class AppModule {}
