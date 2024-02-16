import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "./products.model";

interface HistoryCreationAttrs {
  productVersion: number;
  price: number;
  productId: number;
}


@Table({ tableName: "price-history", paranoid: true })
export class PriceHistory extends Model<PriceHistory, HistoryCreationAttrs> {
  @ApiProperty({ example: 1, description: "Unique" })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.INTEGER })
  price: number;

  @Column({ type: DataType.INTEGER })
  productVersion: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  productId: number;

  @BelongsTo(() => Product)
  product: Product;
}