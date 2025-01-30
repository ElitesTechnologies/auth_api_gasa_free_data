import { Module } from "@nestjs/common";
import { UserService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./users.controller";
import { User } from "./users.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
  controllers: [UserController],
})
export class UsersModule {}
