import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from '../crypto/password.service';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany();

    return UserMapper.toResponseList(users);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(data: {
    name?: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await this.passwordService.hash(data.password);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return UserMapper.toResponse(user);
  }
}