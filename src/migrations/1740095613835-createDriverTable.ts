import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";

export class CreateDriverTable1740095613835 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "drivers",
          columns: [
            {
              name: "id",
              isPrimary: true,
              type: "int",
              isGenerated: true,
              generationStrategy: "increment",
            },
            {
              name: "full_address",
              type: "varchar",
              length: "255",
              isNullable: true,
            },
            {
              name: "document",
              type: "varchar",
              length: "20",
              isNullable: false,
            },
            {
              name: "user_id",
              type: "int",
              isNullable: false,
            },
            {
              name: "created_at",
              type: "timestamp",
              default: "now()",
            },
            {
              name: "updated_at",
              type: "timestamp",
              default: "now()",
            },
          ],
      })
    );

    await queryRunner.createForeignKey(
      "drivers",
      new TableForeignKey({
        name: "FK_driver_id",
        columnNames: ["driver_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("drivers");
  }

}
