import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Product } from "./Product";
import { Movement } from "./Movement";

@Entity("branches")
export class Branch {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    full_address: string;

    @Column({ type: "varchar", length: 30, nullable: false })
    document: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @OneToOne(() => User, (user) => user.branch)
    @JoinColumn({name: "user_id", referencedColumnName: "id"})
    user: User; 

    @OneToMany(() => Product, (product) => product.branch)
    products: Product[];

    @OneToMany(() => Movement, movement => movement.destinationBranch)
    movements: Movement[];

}