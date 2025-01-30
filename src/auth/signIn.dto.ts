import { IsEmail } from "class-validator";

export class signInDto {
  @IsEmail()
  email: string;
  password: string;
}
