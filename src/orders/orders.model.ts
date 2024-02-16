import { Column, Model, Table, DataType, HasMany, ForeignKey, BelongsTo } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { OrderDetails } from "./order-details.model";
import { User } from "../users/users.model";

@Table({ tableName: "orders" })
export class Order extends Model<Order> {
  @ApiProperty({ example: 1, description: "Unique" })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: "50 000" })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  card: number;

  @ApiProperty({ example: "50 000" })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  cash: number;

  @ApiProperty({ example: "-50 000" })
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  returned: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => OrderDetails)
  products: OrderDetails[];
}