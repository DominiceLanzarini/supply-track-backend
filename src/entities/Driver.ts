import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "./User";
import { Movement } from "./Movement";

@Entity("drivers")
export class Driver {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    full_address: string;

    @Column({ type: "varchar", length: 30, nullable: false })
    document: string;

    @CreateDateColumn({type: "timestamp"})
    created_at: Date;

    @UpdateDateColumn({type: "timestamp"})
    updated_at: Date;

    @OneToOne(() => User, (user) => user.driver)
    @JoinColumn({name: "user_id"})
    user: User;

    @OneToMany(() => Movement, movement => movement.driver)
    movements: Movement[];

}