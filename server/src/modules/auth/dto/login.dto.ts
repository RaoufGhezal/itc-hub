import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password required' })
  @MinLength(6, { message: 'Password too short' })
  password!: string;
}
