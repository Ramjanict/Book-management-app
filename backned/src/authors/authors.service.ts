import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAuthorProfileDto } from './dto/update-author-profile.dto';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMine(userId: string) {
    const profile = await this.prisma.authorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { books: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Author profile not found');
    }

    return profile;
  }

  async updateMine(userId: string, dto: UpdateAuthorProfileDto) {
    if (dto.socialLinks) {
      this.assertSocialLinks(dto.socialLinks);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.AuthorProfileUpdateInput = {};
    if (dto.penName !== undefined) data.penName = dto.penName;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.socialLinks !== undefined) {
      data.socialLinks = dto.socialLinks as Prisma.InputJsonValue;
    }

    return this.prisma.authorProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        penName: dto.penName || user.name,
        bio: dto.bio,
        website: dto.website,
        socialLinks:
          dto.socialLinks !== undefined
            ? (dto.socialLinks as Prisma.InputJsonValue)
            : undefined,
      },
    });
  }

  async findPublic(id: string) {
    const profile = await this.prisma.authorProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      select: {
        id: true,
        penName: true,
        bio: true,
        website: true,
        socialLinks: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatar: true } },
        books: {
          where: { status: BookStatus.PUBLISHED },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            price: true,
            publishedYear: true,
            language: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Author not found');
    }

    return profile;
  }

  private assertSocialLinks(links: Record<string, string>) {
    if (Array.isArray(links)) {
      throw new BadRequestException('Social links must be an object');
    }

    const entries = Object.entries(links);
    if (entries.length > 10) {
      throw new BadRequestException('A profile can have at most 10 social links');
    }

    for (const [key, value] of entries) {
      if (
        typeof key !== 'string' ||
        !key.trim() ||
        key.length > 40 ||
        typeof value !== 'string' ||
        value.length > 300
      ) {
        throw new BadRequestException('Invalid social links');
      }
    }
  }
}
