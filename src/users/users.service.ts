import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./users.entity"; // Entité représentant un utilisateur
import * as fs from "fs";
import * as csvParser from "csv-parser";
//import { UserFetch } from './user.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Utilisation de TypeORM pour interagir avec une base de données
  ) {}

  private result: {
    nom?: string;
    prenom?: string;
    email?: string;
    numtel?: string;
    numMomo?: string;
    numMomo2?: string;
  } = {};

  async FindUserbyMatricule(
    searchValue: string,
    email: string,
    nom: string,
    prenom: string,
    password: string,
    confirmPassword: string,
    numTel: string,
    numMomo: string,
  ): Promise<{
    id: number;
    name: string;
    prenom: string;
    email: string;
    numTel: string;
    numMomo: string;
    numMomo2: string;
  } | null> {
    const filePath = "src/users/xample1.csv";
    const searchColumn = "Matricule";

    return new Promise((resolve, reject) => {
      let result: {
        nom: string;
        prenom: string;
        email: string;
        numTel: string;
        numMomo: string;
        numMomo2: string;
      } | null = null;

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          if (row[searchColumn] && row[searchColumn] === searchValue) {
            result = row;
          }
        })
        .on("end", async () => {
          if (result) {
            try {
              // Validation des données utilisateur
              const isEmailValid = await this.validateEmail(email);
              if (!isEmailValid) {
                throw new Error("Email invalide.");
              }

              const isNumTelValid = await this.validatePhoneNumber(numTel);
              if (!isNumTelValid) {
                throw new Error("Numéro de téléphone invalide.");
              }

              const isNumMomoValid = await this.validatePhoneNumber(numMomo);
              if (!isNumMomoValid) {
                throw new Error("Numéro Mobile Money invalide.");
              }

              // Vérification des mots de passe
              if (password !== confirmPassword) {
                throw new Error("Les mots de passe ne correspondent pas.");
              }

              // Hachage du mot de passe
              const hashedPassword = await this.passwordCrypt(password);

              // Création de l'utilisateur
              const user = {
                matricule: searchValue,
                name: nom,
                prenom: prenom,
                password: hashedPassword, // pour enregistrer le mot de passe haché
                email,
                numTel,
                numMomo,
              };

              // Vérifications dans la base
              await this.findByEmail(email);
              await this.findByMatricule(user.matricule);

              // Création et sauvegarde dans la base
              const newUser = this.userRepository.create(user);
              const savedUser = await this.userRepository.save(newUser);

              // Retourner l'utilisateur créé avec son ID
              resolve({
                id: savedUser.id,
                name: result.nom,
                prenom: result.prenom,
                email: result.email,
                numTel: result.numTel,
                numMomo: result.numMomo,
                numMomo2: result.numMomo2 || null,
              });
            } catch (error) {
              console.error(
                "Erreur lors de la création de l’utilisateur :",
                error.message,
              );
              reject(error);
            }
          } else {
            console.log("Matricule non trouvé dans le fichier.");
            resolve(null);
          }
        })
        .on("error", (err) => {
          console.error("Erreur lors du traitement :", err);
          reject(err);
        });
    });
  }

  //verifier le format de l'email
  async validateEmail(email: string): Promise<boolean> {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }
  //verifier le format du numero de téléphone
  async validatePhoneNumber(phone: string): Promise<boolean> {
    const phonePattern = /^\+?[1-9]\d{1,14}$/; //  validation pour un numéro international
    return phonePattern.test(phone);
  }

  //hasher le mots de passe
  async passwordCrypt(password: string) {
    const salt = await bcrypt.genSalt(10); // Génère un salt avec 10 tours
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
  // Fonction pour traiter ou sauvegarder l'utilisateur trouvé
  saveUser(user: {
    nom: string;
    prenom: string;
    password: string;
    email: string;
    numtel: string;
    numMomo: string;
  }): void {
    //enregistrer dans la base de donée
    const newUser = this.userRepository.create(user);
    this.userRepository.save(newUser);
  }

  //pour trouver un utilisateur dans la base de donnée
  async findByMatricule(matricule: string): Promise<void> {
    const existMatricule = await this.userRepository.findOne({
      where: { matricule },
    });
    if (existMatricule) {
      throw new ConflictException(
        "un utilisateur avec ce matricule existe deja dans la base de donnée",
      );
    }
  }
  async findByEmail(email: string): Promise<void> {
    console.log("Recherche de l'email:", email); // Ajout de log
    const existMatricule = await this.userRepository.findOne({
      where: { email },
    });
    //console.log(existMatricule);

    if (existMatricule) {
      throw new ConflictException(
        "Un utilisateur avec cet email existe déjà dans la base de données",
      );
    }
  }

  // Mettre à jour un utilisateur
  async updatePassword(
    matricule: string,
    password: string, // Ancien mot de passe
    newPassword: string, // Nouveau mot de passe
  ) {
    // Trouver l'utilisateur par son matricule
    const user = await this.userRepository.findOne({ where: { matricule } });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier si l'ancien mot de passe est correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        status: true,
        message: "Ancien mot de passe incorrect",
      };
    }

    // Vérifier si le nouveau mot de passe est identique à l'ancien
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return {
        status: true,
        message:
          "Le nouveau mot de passe ne peut pas être identique à l'ancien",
      };
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;

    // Sauvegarder les modifications
    return this.userRepository.save(user);
  }

  // Supprimer un utilisateur
  async deleteUser(matricule: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { matricule } });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    await this.userRepository.remove(user);
  }

  //ajouter le numero momo2
  async addMomo(matricule: string, momoNumber: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { matricule } });

    if (!user) {
      return "Matricule non trouvé";
    }

    if (user.numMomo2) {
      return "Le numéro Momo est déjà enregistré";
    }

    user.numMomo2 = momoNumber;
    await this.userRepository.save(user);

    return "Numéro Momo enregistré avec succès";
  }

  //compte du nombre de user enregistrer dans la base
  async countUser(): Promise<any> {
    const count = await this.userRepository.count();
    return count;
  }
}
