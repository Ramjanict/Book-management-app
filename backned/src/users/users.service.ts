import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  authorProfile: {
    select: {
      id: true,
      penName: true,
      bio: true,
      website: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        avatar: dto.avatar,
      },
      select: userSelect,
    });

    return { message: 'Profile updated', data: user };
  }

  async findAll(query: UserQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...userSelect,
          _count: {
            select: {
              reviews: true,
              borrowRecords: true,
              favorites: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userSelect,
        _count: {
          select: {
            reviews: true,
            borrowRecords: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStatus(actorId: string, userId: string, status: UserStatus) {
    if (actorId === userId) {
      throw new ForbiddenException('You cannot change your own account status');
    }

    const user = await this.findUserOrThrow(userId);

    if (user.role === Role.ADMIN && status !== UserStatus.ACTIVE) {
      await this.assertNotLastActiveAdmin(userId);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: userSelect,
    });

    if (status !== UserStatus.ACTIVE) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'User status updated', data: updated };
  }

  async updateRole(actorId: string, userId: string, role: Role) {
    if (actorId === userId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    const user = await this.findUserOrThrow(userId);

    if (user.role === Role.ADMIN && role !== Role.ADMIN) {
      await this.assertNotLastActiveAdmin(userId);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (role === Role.AUTHOR) {
        await tx.authorProfile.upsert({
          where: { userId },
          update: {},
          create: { userId, penName: user.name },
        });
      }

      return tx.user.update({
        where: { id: userId },
        data: { role },
        select: userSelect,
      });
    });

    return { message: 'User role updated', data: updated };
  }

  private async findUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, status: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async assertNotLastActiveAdmin(userId: string) {
    const remaining = await this.prisma.user.count({
      where: {
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        NOT: { id: userId },
      },
    });

    if (remaining === 0) {
      throw new BadRequestException('At least one active admin must remain');
    }
  }
}
