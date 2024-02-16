import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class Products {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;
  @IsNotEmpty()
  @IsNumber()
  readonly quantity: number;
}

export class CreateOrderDto {
  @Type(() => Products)
  products: Products[];
  @IsNumber()
  readonly card: number;
  @IsNumber()
  readonly cash: number;
}