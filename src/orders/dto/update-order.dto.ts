import { Type } from "class-transformer";

export class products {
  readonly productId: number;
  readonly returnedQuantity: number;
}

export class UpdateOrderDto {
  @Type(() => products)
  products: products[];
}