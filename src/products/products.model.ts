import { Column, Model, Table, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "../categories/categories.model";
import { PriceHistory } from "./price-history.model";

interface ProductCreationAttrs {
  name: string;
  price: number;
  categoryId?: number;
}

@Table({ tableName: "products", paranoid: true })
export class Product extends Model<Product, ProductCreationAttrs> {
  @ApiProperty({ example: 1, description: "Unique" })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: "Somsa", description: "Name of the products" })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @ApiProperty({ example: "70 000", description: "Cost of the products" })
  @Column({ type: DataType.INTEGER, allowNull: false })
  price: number;

  @ApiProperty({ example: "false" })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isAvailable: boolean;

  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  version: number;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: true })
  categoryId: number;

  @BelongsTo(() => Category)
  category: Category;

  @HasMany(() => PriceHistory)
  history: PriceHistory[];
}