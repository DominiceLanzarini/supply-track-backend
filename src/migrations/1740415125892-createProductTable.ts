import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductTable1740415125892 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "products",
            columns: [
                {
                    name: "id",
                    isPrimary: true,
                    type: "int",
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "name",
                    type: "varchar",
                    length: "200",
                    isNullable: false,
                },
                {
                    name: "amount",
                    type: "int",
                    isNullable: false,
                },
                {
                    name: "description",
                    type: "varchar",
                    length: "200",
                    isNullable: false,
                },
                {
                    name: "url_cover",
                    type: "varchar",
                    length: "200",
                    isNullable: true,
                },
                {
                    name: "branch_id",
                    type: "int",
                    isNullable: false,
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
    )
  
    await queryRunner.createForeignKey(
        "products",
            new TableForeignKey({
                name: "FK_branch_id",
                columnNames: ["branch_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "branches",
                onDelete: "CASCADE", // Se um branch for deletado, os produtos relacionados também serão
            })
    )
  }


  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("products");
    }
    
}
