import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Etudiant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matricule: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  name: string;

  @Column()
  prenom: string;

  @Column()
  numTel: string;

  @Column()
  numMomo: string;

  @Column({ nullable: true })
  numMomo2: string;

  @Column({ nullable: true })
  resetCode: string; // Code de réinitialisation

  @Column({ nullable: true })
  resetCodeExpires: Date; // Expiration du code
}
