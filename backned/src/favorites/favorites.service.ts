import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFavorite(userId: string, bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== BookStatus.PUBLISHED) {
      throw new BadRequestException(
        'Only published books can be added to favorites',
      );
    }

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorited: false, message: 'Removed from favorites' };
    } else {
      await this.prisma.favorite.create({
        data: { userId, bookId },
      });
      return { isFavorited: true, message: 'Added to favorites' };
    }
  }

  async getMyFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          include: {
            category: { select: { id: true, name: true } },
            author: { select: { penName: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
    });

    return favorites.map((fav) => {
      const book = fav.book;
      const totalRatings = book.reviews.length;
      const avgRating =
        totalRatings > 0
          ? Number(
              (
                book.reviews.reduce((acc, curr) => acc + curr.rating, 0) /
                totalRatings
              ).toFixed(1),
            )
          : 0;

      const { reviews, ...rest } = book;
      return {
        favoriteId: fav.id,
        savedAt: fav.createdAt,
        book: {
          ...rest,
          averageRating: avgRating,
          totalReviews: totalRatings,
        },
      };
    });
  }

  async checkIsFavorited(userId: string, bookId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    return { isFavorited: !!favorite };
  }
}
