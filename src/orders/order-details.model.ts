import { Column, Model, Table, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { Order } from "./orders.model";
import { Product } from "../products/products.model";

@Table({ tableName: "order-details" })
export class OrderDetails extends Model<OrderDetails> {
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.INTEGER })
  productVersion: number;

  @Column({ type: DataType.INTEGER })
  quantity: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  returnedQuantity: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  productId: number;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  orderId: number;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => Order)
  order: Order;
}