import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class Movements1740861521126 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "movements",
        columns: [
          {
            name: "id",
            isPrimary: true,
            type: "int",
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "destination_branch_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "product_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "driver_id",
            type: "int",
            isNullable: false,
          },
          {
            name: "quantity",
            type: "int",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["PENDING", "IN_PROGRESS", "FINISHED"],
            default: "'PENDING'",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        name: "FK_destination_branch_id",
        columnNames: ["destination_branch_id"],
        referencedTableName: "branches",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        name: "FK_product_id",
        columnNames: ["product_id"],
        referencedTableName: "products",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "movements",
      new TableForeignKey({
        name: "FK_driver_id",
        columnNames: ["driver_id"],
        referencedTableName: "drivers",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("movements");
  }
}
