import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProtected } from '../common/decorators/api-protected.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Public reviews for one book.' })
  getReviewsForBook(@Param('bookId') bookId: string) {
    return this.reviewsService.getReviewsForBook(bookId);
  }

  @Post('book/:bookId')
  @UseGuards(JwtAuthGuard)
  @ApiProtected()
  @ApiOperation({ summary: 'Create or update the signed-in user’s review. Published books only.' })
  createOrUpdate(
    @CurrentUser() user: AuthUser,
    @Param('bookId') bookId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createOrUpdate(user.id, bookId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiProtected('the review owner or ADMIN')
  @ApiOperation({ summary: 'Delete a review. Owners and admins only.' })
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.reviewsService.delete(user.id, user.role, id);
  }
}
