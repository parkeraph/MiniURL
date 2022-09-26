import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  domain: string;
}
