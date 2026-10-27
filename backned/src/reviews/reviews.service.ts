import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookStatus, Role } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdate(userId: string, bookId: string, dto: CreateReviewDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== BookStatus.PUBLISHED) {
      throw new BadRequestException('Reviews are only allowed on published books');
    }

    const review = await this.prisma.review.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: {
        rating: dto.rating,
        comment: dto.comment,
      },
      create: {
        userId,
        bookId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return {
      message: 'Review saved successfully',
      data: review,
    };
  }

  async getReviewsForBook(bookId: string) {
    return this.prisma.review.findMany({
      where: { bookId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
  }

  async delete(userId: string, userRole: Role, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (userRole !== Role.ADMIN && review.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}
