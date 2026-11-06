import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { id: true, fullName: true, email: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
