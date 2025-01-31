import {
  Controller,
  Put,
  Delete,
  Param,
  Body,
  Get,
  Post,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { UserService } from "./users.service";
import { Etudiant } from "./users.entity";

@Controller("users")
export class UserController {
  findAll() {
    throw new Error("Method not implemented.");
  }
  csvService: any;
  constructor(private readonly userService: UserService) {}

  //recuperer les données de la fonction FindUserbyMatricule et les enregistrer
  @Post("Register")
  async getAndCreateUser(
    @Body()
    body: {
      matricule: string;
      email: string;
      nom: string;
      prenom: string;
      password: string;
      confirmPassword: string;
      numTel: string;
      numMomo: string;
      numMomo2: string;
    },
  ): Promise<any> {
    const {
      matricule,
      email,
      nom,
      prenom,
      password,
      confirmPassword,
      numTel,
      numMomo,
      numMomo2,
    } = body;

    try {
      // Appel de la fonction FindUserbyMatricule dans le service
      const user = await this.userService.FindUserbyMatricule(
        matricule,
        email,
        nom,
        prenom,
        password,
        confirmPassword,
        numTel,
        numMomo,
      );

      console.log("User returned from service:", user); // Log pour déboguer

      if (!user) {
        return {
          message: "Matricule introuvable dans le fichier.",
          user: null,
        };
      }

      return {
        status: true,
        message: "Informations enregistrées avec succès",
        User: {
          id: user.id,
          matricule: matricule,
          email: email,
          nom: nom,
          prenom: prenom,
          numTel: numTel,
          numMomo: numMomo,
          numMomo2: user.numMomo2,
        },
      };
    } catch (error) {
      console.error("Error in getAndCreateUser:", error); // Log pour déboguer
      return {
        message: "Erreur lors de la création de l’utilisateur.",
      };
    }
  }

  //supprimer un utilisateur
  @Delete(":matricule")
  async deleteUser(@Param("matricule") matricule: string): Promise<void> {
    return this.userService.deleteUser(matricule);
  }

  //modifier le password
  @Put("update-password/:matricule")
  async updatePassword(
    @Param("matricule") matricule: string,
    @Body("password") password: string,
    @Body("newPassword") newPassword: string,
  ) {
    try {
      await this.userService.updatePassword(matricule, password, newPassword);
      return { status: true, message: "Mot de passe mis à jour avec succès" };
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          message:
            "erreur lors  de la modification du mots de passe, vérifiez les données entrer ",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //ajout de numéro momo
  @Put("addmomo/:matricule")
  async addMomo(
    @Param("matricule") matricule: string,
    @Body("numMomo2") numMomo2: string,
  ) {
    console.log("Matricule reçu :", matricule);
    console.log("NumMomo2 reçu :", numMomo2);

    try {
      await this.userService.addMomo(matricule, numMomo2);
      return {
        status: true,
        message: "numéro ajouté",
      };
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          message: "le numéro momo a deja été enregistré",
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
