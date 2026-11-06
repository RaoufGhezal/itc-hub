import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name required' })
  fullName!: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password required' })
  @MinLength(6, { message: 'Password too short' })
  password!: string;
}
