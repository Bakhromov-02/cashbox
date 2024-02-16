import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.model";

interface RoleCreationAttrs {
  value: string;
  description: string;
}

@Table({ tableName: "roles" })
export class Roles extends Model<Roles, RoleCreationAttrs> {
  @ApiProperty({ example: 1, description: "Unique value" })
  @Column({ type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true })
  id: number;

  @ApiProperty({ example: "cashier", description: "The role of the user" })
  @Column({ type: DataType.STRING, unique: true })
  value: string;

  @ApiProperty({ example: "can only sell products"})
  @Column({ type: DataType.STRING})
  description: string;

  @HasMany(() => User, { onDelete: "SET NULL" })
  user: [User];
}