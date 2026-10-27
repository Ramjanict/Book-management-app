import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';
import { UpdateBookStatusDto } from './dto/update-book-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '../common/decorators/api-protected.decorator';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // 1. Public catalog
  @Get()
  @ApiOperation({ summary: 'Paginated catalog of published books. Supports search, category, and sort.' })
  findAllPublic(@Query() query: BookQueryDto) {
    return this.booksService.findAllPublic(query);
  }

  // 2. Author Portal: view all own books (drafts, pending, published)
  @Get('author/my-books')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiProtected('AUTHOR, ADMIN')
  @ApiOperation({ summary: 'The signed-in author’s books, including drafts and submissions.' })
  findAuthorBooks(@CurrentUser() user: AuthUser, @Query() query: BookQueryDto) {
    return this.booksService.findAuthorBooks(user.id, query);
  }

  // 3. Admin: list all books regardless of status
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiProtected('ADMIN')
  @ApiOperation({ summary: 'Every book, in every status, for moderation.' })
  findAllAdmin(@Query() query: BookQueryDto) {
    return this.booksService.findAllAdmin(query);
  }

  // 4. Public single book details
  @Get(':idOrSlug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Book details. Guests only see published books. Authors can open their own drafts when a token is sent.' })
  findOne(
    @Param('idOrSlug') idOrSlug: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.booksService.findOne(idOrSlug, user);
  }

  // 5. Author or Admin creates book
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiProtected('AUTHOR, ADMIN')
  @ApiOperation({ summary: 'Create a book. Authors cannot publish or archive directly.' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBookDto) {
    return this.booksService.create(user.id, user.role, dto);
  }

  // 6. Admin update book status (e.g. approve -> PUBLISHED, or ARCHIVED)
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiProtected('ADMIN')
  @ApiOperation({ summary: 'Publish, archive, or return a book to draft.' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookStatusDto,
  ) {
    return this.booksService.updateStatus(id, dto.status);
  }

  // 7. Author or Admin update book details
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiProtected('AUTHOR, ADMIN')
  @ApiOperation({ summary: 'Edit a book. Authors can edit only their own books.' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(id, user.id, user.role, dto);
  }

  // 8. Author (own book) or Admin deletes book
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AUTHOR, Role.ADMIN)
  @ApiProtected('AUTHOR, ADMIN')
  @ApiOperation({ summary: 'Delete a book. Authors can delete only their own books.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.booksService.remove(id, user.id, user.role);
  }
}
