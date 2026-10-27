import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { BookStatus, BorrowStatus, Prisma } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<BorrowStatus, BorrowStatus[]> = {
  [BorrowStatus.REQUESTED]: [BorrowStatus.APPROVED, BorrowStatus.CANCELLED],
  [BorrowStatus.APPROVED]: [BorrowStatus.BORROWED, BorrowStatus.CANCELLED],
  [BorrowStatus.BORROWED]: [
    BorrowStatus.RETURNED,
    BorrowStatus.OVERDUE,
    BorrowStatus.CANCELLED,
  ],
  [BorrowStatus.OVERDUE]: [BorrowStatus.RETURNED],
  [BorrowStatus.RETURNED]: [],
  [BorrowStatus.CANCELLED]: [],
};

function copyIsOut(status: BorrowStatus) {
  return status === BorrowStatus.BORROWED || status === BorrowStatus.OVERDUE;
}

@Injectable()
export class BorrowService {
  constructor(private readonly prisma: PrismaService) {}

  async requestBorrow(userId: string, bookId: string, dto: CreateBorrowDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== BookStatus.PUBLISHED) {
      throw new BadRequestException('This book is not currently available for borrowing');
    }

    if (book.stockQuantity <= 0) {
      throw new BadRequestException('This book is currently out of stock');
    }

    // Check if user already has an active borrow or pending request for this book
    const existingRecord = await this.prisma.borrowRecord.findFirst({
      where: {
        userId,
        bookId,
        status: {
          in: [BorrowStatus.REQUESTED, BorrowStatus.APPROVED, BorrowStatus.BORROWED],
        },
      },
    });

    if (existingRecord) {
      throw new ConflictException(
        `You already have an active request or borrowing record for this book (Status: ${existingRecord.status})`,
      );
    }

    const dueDate = this.resolveDueDate(dto.dueDate);

    const record = await this.prisma.borrowRecord.create({
      data: {
        userId,
        bookId,
        status: BorrowStatus.REQUESTED,
        dueDate,
      },
      include: {
        book: {
          select: { title: true, coverImage: true, isbn: true },
        },
      },
    });

    return {
      message: 'Borrow request submitted successfully',
      data: record,
    };
  }

  async getMyRecords(userId: string) {
    return this.prisma.borrowRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            author: { select: { penName: true } },
          },
        },
      },
    });
  }

  async getAllRecords(status?: BorrowStatus) {
    const where = status ? { status } : {};
    return this.prisma.borrowRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true, slug: true, stockQuantity: true } },
      },
    });
  }

  async cancelOwn(userId: string, recordId: string) {
    const record = await this.findOwnedRecord(userId, recordId);

    if (
      record.status !== BorrowStatus.REQUESTED &&
      record.status !== BorrowStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Only a requested or approved loan can be cancelled. Ask to return a copy that is already out.',
      );
    }

    const updated = await this.prisma.borrowRecord.update({
      where: { id: recordId },
      data: { status: BorrowStatus.CANCELLED },
      include: {
        book: { select: { id: true, title: true, coverImage: true } },
      },
    });

    return { message: 'Borrow request cancelled', data: updated };
  }

  async requestReturn(userId: string, recordId: string) {
    const record = await this.findOwnedRecord(userId, recordId);

    if (!copyIsOut(record.status)) {
      throw new BadRequestException(
        'A return can only be requested for a borrowed or overdue copy',
      );
    }

    if (record.returnRequestedAt) {
      return {
        message: 'Return already requested',
        data: record,
      };
    }

    const updated = await this.prisma.borrowRecord.update({
      where: { id: recordId },
      data: { returnRequestedAt: new Date() },
      include: {
        book: { select: { id: true, title: true, coverImage: true } },
      },
    });

    return {
      message: 'Return requested. An admin will confirm the copy is back.',
      data: updated,
    };
  }

  async updateStatus(recordId: string, newStatus: BorrowStatus) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id: recordId },
      include: { book: true },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    const allowed = ALLOWED_TRANSITIONS[record.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${record.status} to ${newStatus}`,
      );
    }

    const wasOut = copyIsOut(record.status);
    const willBeOut = copyIsOut(newStatus);

    return this.prisma.$transaction(async (tx) => {
      if (!wasOut && willBeOut) {
        const book = await tx.book.findUnique({
          where: { id: record.bookId },
          select: { stockQuantity: true },
        });

        if (!book || book.stockQuantity <= 0) {
          throw new BadRequestException(
            'Cannot mark borrowed: book is out of stock',
          );
        }

        await tx.book.update({
          where: { id: record.bookId },
          data: { stockQuantity: { decrement: 1 } },
        });
      }

      if (wasOut && !willBeOut) {
        await tx.book.update({
          where: { id: record.bookId },
          data: { stockQuantity: { increment: 1 } },
        });
      }

      const data: Prisma.BorrowRecordUpdateInput = { status: newStatus };

      if (newStatus === BorrowStatus.BORROWED && !record.borrowDate) {
        data.borrowDate = new Date();
      }

      if (newStatus === BorrowStatus.RETURNED) {
        data.returnDate = new Date();
      }

      return tx.borrowRecord.update({
        where: { id: recordId },
        data,
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true, stockQuantity: true } },
        },
      });
    });
  }

  private resolveDueDate(requested?: string) {
    const now = new Date();
    const fallback = new Date(now);
    fallback.setDate(fallback.getDate() + 14);

    if (!requested) {
      return fallback;
    }

    const dueDate = new Date(requested);
    const min = new Date(now);
    min.setDate(min.getDate() + 1);
    const max = new Date(now);
    max.setDate(max.getDate() + 60);

    if (Number.isNaN(dueDate.getTime()) || dueDate < min || dueDate > max) {
      throw new BadRequestException(
        'Due date must be between 1 and 60 days from today',
      );
    }

    return dueDate;
  }

  private async findOwnedRecord(userId: string, recordId: string) {
    const record = await this.prisma.borrowRecord.findUnique({
      where: { id: recordId },
      include: {
        book: { select: { id: true, title: true, coverImage: true } },
      },
    });

    if (!record) {
      throw new NotFoundException('Borrow record not found');
    }

    if (record.userId !== userId) {
      throw new ForbiddenException('You can only manage your own borrow records');
    }

    return record;
  }
}
