import { IsNotEmpty, IsString, Length } from "class-validator";

export class AuthUserDto {
  /**
   * Username
   * @example uniqueUser
   * */
  @IsString()
  @IsNotEmpty()
  readonly username: string;
  /**
   * User's password
   * @example thisIsPassword
   */
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, {})
  readonly password: string;
}