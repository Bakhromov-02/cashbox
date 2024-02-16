import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
  /**
   * Category name
   * @example First meal
   * */
  @IsString()
  @IsNotEmpty()
  name: string;
}