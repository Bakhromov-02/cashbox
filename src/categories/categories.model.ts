import { Column, Model, Table, DataType, HasMany } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "../products/products.model";


@Table({ tableName: "categories" })
export class Category extends Model<Category> {
  @ApiProperty({ example: 1, description: "Unique" })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: "First meal", description: "Name of the category" })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @ApiProperty({ example: "false" })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isAvailable: boolean;

  @HasMany(() => Product, { onDelete: "SET NULL" })
  products: Product[];
}