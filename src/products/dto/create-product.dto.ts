import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsNumber()
  @IsNotEmpty()
  readonly price: number;
  // @IsNumber()
  readonly categoryId?: number;
}