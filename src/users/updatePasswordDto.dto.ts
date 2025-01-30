import { IsString, MinLength, MaxLength } from "class-validator";

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6, {
    message: "Le mot de passe doit avoir au moins 6 caractères.",
  })
  @MaxLength(20, {
    message: "Le mot de passe ne peut pas dépasser 20 caractères.",
  })
  password: string;
}
