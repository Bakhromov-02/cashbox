import { CreateCategoryDto } from "./create-category.dto";
import { PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsNotEmpty()
  @IsBoolean()
  isAvailable?: boolean;
}