import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class url {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    full_url: string

    //TODO: rename to mini_url_code
    @Column()
    mini_url: string

    @Column()
    creation_date: number
}