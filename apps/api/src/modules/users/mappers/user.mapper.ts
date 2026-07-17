import { User } from '@prisma/client';

export class UserMapper {
  static toResponse(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponseList(users: User[]) {
    return users.map((user) => this.toResponse(user));
  }
}