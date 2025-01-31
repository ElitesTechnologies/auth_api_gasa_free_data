import { Module } from "@nestjs/common";
import { UserService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./users.controller";
import { Etudiant } from "./users.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Etudiant])],
  providers: [UserService],
  controllers: [UserController],
})
export class UsersModule {}
