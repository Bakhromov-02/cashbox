import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class CreateUserDto {
  /**
   * Username
   * @example uniqueUser
   * */
  @IsString()
  @IsNotEmpty()
  readonly username: string;
  /**
   * User's real name
   * @example John_Doe
   * */
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  /**
   * User's password
   * @example thisIsPassword
   */
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {})
  readonly password: string;
  /**
   * User's role
   * @example 3
   */
  @IsNumber()
  @IsNotEmpty()
  readonly roleId: number;
}