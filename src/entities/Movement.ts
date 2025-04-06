import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Branch } from "./Branch";
import { Product } from "./Product";
import { Driver } from "./Driver";

export enum MovementStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    FINISHED = "FINISHED"
}

@Entity("movements")
export class Movement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    quantity: number;

    @Column({
        type: "enum",
        enum: MovementStatus,
        default: MovementStatus.PENDING
    })
    status: MovementStatus;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at: Date;

    @ManyToOne(() => Branch, branch => branch.movements, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({name: "destination_branch_id"})
    destinationBranch: Branch;

    @ManyToOne(() => Product, product => product.movements, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({name: "product_id"})
    product: Product;

    @ManyToOne(() => Driver, driver => driver.movements, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({name: "driver_id"})
    driver: Driver;
}
