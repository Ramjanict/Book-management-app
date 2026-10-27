import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BookStatus } from '@prisma/client';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);

    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ name: { equals: dto.name, mode: 'insensitive' } }, { slug }],
      },
    });

    if (existing) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            books: {
              where: { status: BookStatus.PUBLISHED },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(idOrSlug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        books: {
          where: { status: BookStatus.PUBLISHED },
          include: {
            author: {
              select: {
                penName: true,
                user: { select: { name: true, avatar: true } },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    const data: { name?: string; slug?: string; description?: string } = {
      description: dto.description,
    };

    if (dto.name && dto.name !== category.name) {
      const slug = slugify(dto.name);
      const existing = await this.prisma.category.findFirst({
        where: {
          OR: [{ name: { equals: dto.name, mode: 'insensitive' } }, { slug }],
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }

      data.name = dto.name;
      data.slug = slug;
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category not found`);
    }

    if (category._count.books > 0) {
      throw new BadRequestException(
        `Cannot delete category containing ${category._count.books} book(s). Please reassign or delete them first.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
