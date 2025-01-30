import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
//import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/users.entity";
import { MailModule } from "src/email/email.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailModule], // Si tu utilises TypeORM
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
