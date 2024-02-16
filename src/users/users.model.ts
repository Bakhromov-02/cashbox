import { Column, Model, Table, DataType, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Roles } from "../roles/roles.model";
import { Order } from "../orders/orders.model";

interface UserCreationAttrs {
  username: string;
  name: string;
  password: string;
}

@Table({ tableName: "users", paranoid: true })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: 1, description: "Unique" })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: "username", description: "Username will be unique" })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  username: string;

  @ApiProperty({ example: "John Doe", description: "User's real name" })
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty({ example: "password", description: "Should be more than 6 characters" })
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  telegram_id: number;

  @ForeignKey(() => Roles)
  @Column({ type: DataType.INTEGER, allowNull: true })
  roleId: number;

  @BelongsTo(() => Roles)
  role: Roles;

  @HasMany(() => Order)
  orders: Order;
}