import { IsEnum } from "class-validator";

export class CreateOrderDetailsDto {
  readonly productVersion: number;
  readonly productId: number;
  readonly orderId: number;
  readonly type: "ORDERED" | "RETURNED";
}