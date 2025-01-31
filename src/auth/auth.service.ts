import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MailService } from "../email/email.service";
import * as bcrypt from "bcrypt";
import { Etudiant } from "src/users/users.entity";
import { signInDto } from "src/auth/signIn.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Etudiant)
    private userRepository: Repository<Etudiant>, // Utilisation de TypeORM pour interagir avec une base de données
    private readonly mailService: MailService,
  ) {}

  // Connexion des utilisateurs
  async signin(signInDto: signInDto) {
    const { email } = signInDto;
    const { password } = signInDto;

    // Recherche de l'utilisateur par matricule
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        status: false,
        message: "identifiants incorrect",
      };
    }

    // Vérification du mot de passe
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return {
        status: false,
        message: "identifiants incorrect",
      };
    }

    return {
      status: true,
      message: "Connexion réussie",
      User: {
        id: user.id,
        matricule: user.matricule,
        email: user.email,
        name: user.name,
        prenom: user.prenom,
        numTel: user.numTel,
        numMomo: user.numMomo,
        numMomo2: user.numMomo2,
      },
    };
  }

  // Générer un code de réinitialisation
  async generateResetCode(
    email: string,
  ): Promise<{ code: string; status: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException("Utilisateur introuvable.");
    }

    // Générer un code aléatoire à  6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Stocker le code et son expiration
    user.resetCode = resetCode;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // Expiration dans 3 minutes
    await this.userRepository.save(user);

    // Envoyer le code par email
    await this.mailService.sendEmail(user.email, resetCode);

    return {
      code: resetCode,
      status: true,
      message: "Code de réinitialisation envoyé par email.",
    };
  }

  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ status: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || user.resetCode !== code) {
      throw new BadRequestException("Code invalide.");
    }
    return {
      status: true,
      message: "le code est correct",
    };
  }
  // Réinitialisation du mot de passe après validation du code
  async resetPassword(email: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (user.resetCodeExpires < new Date()) {
      // Supprimer le code expiré
      user.resetCode = null;
      user.resetCodeExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException("Le code a expiré.");
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Réinitialiser les champs de code
    user.resetCode = null;
    user.resetCodeExpires = null;
    await this.userRepository.save(user);
  }
}
